"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useGetOneUser } from "./api/get-one-user";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { roleMap, roles } from "@/lib/roles";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUpdateUser } from "./api/update-user";
import { toast } from "sonner";
import type { CreateUser } from "@/service/interfaces/user.interface";

interface UserDetailsModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const editUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(5, { message: "Enter a valid email" })
    .refine((value) => /^\S+@pau\.edu\.ng$/.test(value), {
      message: "Must be a valid PAU email",
    }),
  role: z.string().min(1, "Role is required"),
  is_onboarding: z.boolean().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export function UserDetailsModal({
  userId,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  console.log("User Id from details: ", userId);
  const {
    data: user,
    isLoading,
    refetch,
  } = useGetOneUser(userId ?? "", !!userId && open);

  const { mutateAsync: updateUser, isPending: updating } = useUpdateUser();

  const [editMode, setEditMode] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "",
      is_onboarding: false,
    },
  });

  useEffect(() => {
    if (user) {
      console.log("User role from API:", user.role.name);
      console.log("Available roles:", roles);

      const roleValue =
        roles.find(
          (r) => r.label.toLowerCase() === user.role.name.toLowerCase()
        )?.value || "";

      console.log("Found role value:", roleValue);
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: roleValue,
        is_onboarding: user.is_onboarding,
      });
    }
  }, [user]);

  async function handleSave(values: EditUserFormValues) {
    if (!user) return;
    const { role, ...rest } = values;
    try {
      const userId = user.id;
      const payload = {
        ...rest,
        role_id: roleMap[values.role],
      } as Partial<CreateUser>;

      console.log("User Id from update: ", userId);
      await updateUser({ id: userId, data: payload });
      toast.success("User updated successfully!");
      setEditMode(false);
      onOpenChange(false);
      refetch();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update user.");
    }
  }

  if (isLoading) return <p>Loading user details...</p>;
  if (!user) return <p>No details found</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            {editMode
              ? "Edit user information"
              : "Detailed information about this user"}
          </DialogDescription>
        </DialogHeader>

        {/* Header: Avatar */}
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback>
              {user.first_name[0]}
              {user.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 space-x-1">
              <Badge>{user.role.name}</Badge>
              {user.role.department && (
                <Badge variant="secondary">{user.role.department.name}</Badge>
              )}
            </div>
          </div>
          {!editMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMode(true)}
            >
              <Edit className="w-4 h-4" /> <span>Edit</span>
            </Button>
          )}
        </div>

        {/* Editable Form */}
        {editMode && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-4"
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
                    <FormLabel>Email</FormLabel>
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <FormLabel className="text-base">Onboarding</FormLabel>
                      <FormDescription>
                        If true, you are still in the onboarding process
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

              <div className="flex justify-end space-x-3 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const roleValue =
                      roles.find(
                        (r) =>
                          r.label.toLowerCase() === user.role.name.toLowerCase()
                      )?.value || "";

                    setEditMode(false);
                    form.reset({
                      first_name: user.first_name,
                      last_name: user.last_name,
                      email: user.email,
                      role: roleValue,
                      is_onboarding: user.is_onboarding,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="pau-gradient"
                  disabled={updating}
                >
                  Save
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
