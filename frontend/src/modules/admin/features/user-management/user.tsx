import { useState } from "react";
import { useGetUserForAdmin } from "./api/get-user-stats";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Award,
  EyeOff,
} from "lucide-react";
import z from "zod";
import { roleMap, roles } from "@/lib/roles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CreateUser } from "@/service/interfaces/user.interface";
import { useCreateUser } from "./api/create-user";
import { toast } from "sonner";
import { useDeleteUser } from "./api/delete-user";
import { useAuthState } from "@/store/auth.store";
import { UserDetailsModal } from "./user-details";

const createUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(5, { message: "Enter a valid email" })
    .refine((value) => /^\S+@pau\.edu\.ng$/.test(value), {
      message: "Must be a valid PAU email",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
  is_onboarding: z.boolean().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: createUser, isPending, isError } = useCreateUser();
  const { mutate: deleteUser } = useDeleteUser();
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading } = useGetUserForAdmin(page, limit);
  const { decodedDto } = useAuthState();

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "",
      is_onboarding: false,
    },
  });

  //const userId = decodedDto?.sub.id;

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  async function handleSubmit(values: CreateUserFormValues) {
    const { role, ...rest } = values;
    try {
      const payload = {
        ...rest,
        role_id: roleMap[values.role],
      } as CreateUser;
      await createUser(payload);
      toast.success("✅ User created successfully");
      setShowAddUser(false);
      form.reset();
    } catch (error) {
      console.error("❌ User creation failed:", error);
      toast.error("Failed to create user. Please try again.");
    }
  }

  const handleDelete = (id: string) => {
    deleteUser(id, {
      onSuccess: () => {
        toast.success("✅ User deleted successfully");
      },
      onError: (error: any) => {
        console.error("❌ Delete failed:", error);
        toast.error("Failed to delete user");
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const users = data?.users ?? [];
  console.log("Users: ", users);
  const totalUsers = data?.totalUsers ?? 0;
  const totalCertificates = data?.totalCertificates ?? 0;
  const totalPages = Math.ceil(data ? data.totalUsers / data.limit : 1);

  // Filtering
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      selectedRole === "all" || user.role.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage platform users and their access permissions
          </p>
        </div>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button className="pau-gradient">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for the platform.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="user@pau.edu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_onboarding"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Onboarding Required
                        </FormLabel>
                        <FormDescription>
                          User needs to complete onboarding process
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddUser(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="pau-gradient"
                    disabled={isPending}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="pau-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalCertificates}</p>
                <p className="text-sm text-muted-foreground">
                  Certificates Earned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="pau-shadow">
        <CardContent className="p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by email or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {[...new Set(users.map((u) => u.role))].map((role) => (
                <SelectItem key={role} value={role.toLowerCase()}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="pau-shadow">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {user.first_name} {user.last_name}
                      </h2>
                      <h4 className="font-medium">{user.email}</h4>
                      <p className="text-sm text-muted-foreground">
                        {user.department} • {user.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center text-sm">
                      <div className="font-medium">
                        {user.totalCertificates}
                      </div>
                      <div className="text-muted-foreground">Certificates</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewUser(user.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => user.id && handleDelete(user.id)}
                        disabled={!user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or add a new user.
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
