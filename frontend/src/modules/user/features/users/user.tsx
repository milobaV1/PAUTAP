import { useEffect, useState } from "react";
import { useGetUserForHOD } from "./api/get-user-stats";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Eye, Award } from "lucide-react";
//import { useDeleteUser } from "./api/delete-user";
import { useNavigate } from "@tanstack/react-router";
import { useAuthState } from "@/store/auth.store";
import { useGetUserForDean } from "./api/get-user-stats-dean";
import { isDean, isDirectorOfServices, isHOD } from "@/utils/auth-extension";
import { useGetUserForDOS } from "./api/get-user-stats-dos";

export function Staff() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [page, setPage] = useState(1);
  const limit = 5;
  const { decodedDto, user } = useAuthState();
  const roleName = user?.role.name;
  const roleId = decodedDto?.sub.roleId;
  const departmentId = user?.role.department?.id;

  // Always call all hooks to preserve the rules of hooks
  const hodResult = useGetUserForHOD(
    roleId ?? 0,
    page,
    limit,
    debouncedSearch,
    isHOD() && !!roleId // Add enabled flag
  );

  const deanResult = useGetUserForDean(
    departmentId ?? 0,
    page,
    limit,
    debouncedSearch,
    isDean() && !!departmentId // Add enabled flag
  );

  const dosResult = useGetUserForDOS(
    page,
    limit,
    debouncedSearch,
    isDirectorOfServices() // Add enabled flag
  );
  // Call the role-checking functions (with parentheses) and select the appropriate result
  const isHod = isHOD();
  const isDeanUser = isDean();
  const isDoS = isDirectorOfServices();

  const data = isHod
    ? hodResult.data
    : isDeanUser
      ? deanResult.data
      : isDoS
        ? dosResult.data
        : hodResult.data;
  const isLoading =
    (hodResult.isLoading || deanResult.isLoading || dosResult.isLoading) ??
    false;

  console.log("Staff member data: ", data);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleNavigate = (id: string) => {
    navigate({ to: "/users/$id", params: { id } });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No user</div>;
  }

  const users = data?.users ?? [];
  console.log("Users: ", users);
  const totalUsers = data?.totalUsers ?? 0;
  const totalCertificates = data?.totalCertificates ?? 0;
  const totalPages = Math.ceil(data.totalUsers / data.limit);

  // Filtering
  const filteredUsers = users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1>{`${roleName} Department`}</h1>
          <p className="text-muted-foreground mt-1">
            View staff members in this department
          </p>
        </div>
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
          <CardDescription>View staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarFallback>
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold truncate">
                        {user.first_name} {user.last_name}
                      </h2>
                      <h4 className="font-medium text-sm break-all">
                        {user.email}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.department} • {user.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-4">
                    {/* Certificates */}
                    <div className="flex items-center justify-between md:justify-end md:space-x-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {user.totalCertificates}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Certificate(s)
                        </div>
                      </div>
                    </div>

                    {/* Session Stats */}
                    {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">
                          {user.sessionStats?.totalAttempts || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Attempts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {user.sessionStats?.completed || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {user.sessionStats?.inProgress || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          In Progress
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-orange-600">
                          {user.sessionStats?.averageScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Score
                        </div>
                      </div>
                    </div> */}

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        //onClick={() => setSelectedUserId(user.id)}
                        onClick={() => handleNavigate(user.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => user.id && handleDelete(user.id)}
                        disabled={!user.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button> */}
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
    </div>
  );
}
