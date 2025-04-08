"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export default function UsersTable() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]); // final list to display
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  // Fetch users from the backend.
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      console.error("No token found. Redirecting to login...");
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      // If your backend supports search and pagination, uncomment the following:
      
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, page, limit },
      });
      console.log("Fetched Users:", response.data);
      setAllUsers(response.data?.users || []);
      const total = response.data?.total || 0;
      setTotalPages(Math.ceil(total / limit));
      

      // Fallback: fetch all users (if the backend doesn't support search/pagination)
      // const response = await api.get("/users", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      console.log("Fetched Users:", response.data);
      // Assuming the API returns all users as an array
      const fetchedUsers = response.data?.data?.users || response.data.users || [];
      setAllUsers(fetchedUsers);

      // Update total pages based on filtered data (will recalc below)
      setTotalPages(Math.ceil(fetchedUsers.length / limit));
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router, searchTerm, page, limit]);

  // Apply client-side filtering and pagination if backend does not support it.
  const applyFiltersAndPagination = useCallback(() => {
    // Filter users based on search term.
    const filtered = allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    );
    // Update total pages based on filtered results.
    setTotalPages(Math.ceil(filtered.length / limit) || 1);

    // Get only the users for the current page.
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    setUsers(paginated);
  }, [allUsers, searchTerm, page, limit]);

  // Re-fetch users on mount.
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reapply filtering and pagination whenever dependencies change.
  useEffect(() => {
    applyFiltersAndPagination();
  }, [allUsers, searchTerm, page, limit, applyFiltersAndPagination]);

  const updateRole = async (
    userId: string,
    newRole: "user" | "admin" | "superadmin"
  ) => {
    if (!loggedInUser?.isSuperAdmin) {
      alert("Only Super Admins can change roles!");
      return;
    }

    const updatedUser = {
      isAdmin: newRole === "admin" || newRole === "superadmin",
      isSuperAdmin: newRole === "superadmin",
    };

    try {
      const token = localStorage.getItem("token");
      await api.put(`/users/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh users after update.
      fetchUsers();
      alert("User role updated successfully!");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    }
  };

  // Helper to get user role as string.
  const getUserRole = (user: User) => {
    if (user.isSuperAdmin) return "Super Admin";
    if (user.isAdmin) return "Admin";
    return "User";
  };

  // Export displayed users to Excel (.xlsx).
  const exportToExcel = () => {
    const data = users.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: getUserRole(user),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_export.xlsx");
  };

  // Pagination controls.
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
    setPage(1); // Reset to first page when limit changes.
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Users Management</h1>
      <p>Manage user roles and view registered users.</p>

      <div className="mt-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset page when search term changes.
            }}
            className="w-full p-2 pl-8 border rounded-md"
          />
        </div>
        <div>
          <Button onClick={exportToExcel}>Export to Excel</Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="limit" className="mr-2">
          Show
        </label>
        <select
          id="limit"
          value={limit}
          onChange={handleLimitChange}
          className="border p-1 rounded-md"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <span>users per page</span>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                {loggedInUser?.isSuperAdmin && <TableHead>Change Role</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(
                ({
                  _id,
                  name,
                  email,
                  phone,
                  profilePicture,
                  isAdmin,
                  isSuperAdmin,
                }) => (
                  <TableRow key={_id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={profilePicture || "/placeholder.svg"}
                          alt={name}
                        />
                        <AvatarFallback>
                          {name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{phone}</TableCell>
                    <TableCell>
                      {isSuperAdmin ? (
                        <span className="text-green-500 font-bold">
                          Super Admin
                        </span>
                      ) : isAdmin ? (
                        <span className="text-blue-500 font-bold">Admin</span>
                      ) : (
                        <span className="text-gray-500">User</span>
                      )}
                    </TableCell>
                    {loggedInUser?.isSuperAdmin && (
                      <TableCell>
                        <select
                          value={
                            isSuperAdmin
                              ? "superadmin"
                              : isAdmin
                              ? "admin"
                              : "user"
                          }
                          onChange={(e) =>
                            updateRole(
                              _id,
                              e.target.value as "user" | "admin" | "superadmin"
                            )
                          }
                          className="bg-white text-black border border-gray-300 rounded-md p-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </TableCell>
                    )}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
}
