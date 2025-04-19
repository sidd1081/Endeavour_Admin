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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);

      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedUsers = response.data?.data?.users || response.data.users || [];
      setAllUsers(fetchedUsers);
    } catch (error) {
     
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      fetchUsers();
      alert("User role updated successfully!");
    } catch (error) {
     
      alert("Failed to update user role.");
    }
  };

  const getUserRole = (user: User) => {
    if (user.isSuperAdmin) return "Super Admin";
    if (user.isAdmin) return "Admin";
    return "User";
  };
  useEffect(() => {
    const disableShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };
  
    const disableContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
  
    const detectDevTools = () => {
      const threshold = 160;
      const check = () => {
        const start = new Date().getTime();
        debugger;
        const end = new Date().getTime();
        if (end - start > threshold) {
          alert("DevTools are not allowed.");
          window.close(); // or redirect to a safe page
        }
      };
      setInterval(check, 1000);
    };
  
    document.addEventListener("keydown", disableShortcuts);
    document.addEventListener("contextmenu", disableContextMenu);
    detectDevTools();
  
    return () => {
      document.removeEventListener("keydown", disableShortcuts);
      document.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);
  

  const exportToExcel = () => {
    const data = allUsers.map((user) => ({
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

  const filteredUsers = allUsers
  .filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
  )
  .sort((a, b) => {
    const getPriority = (user: User) => {
      if (user.isSuperAdmin) return 0; 
      if (user.isAdmin) return 1;      
      return 2;                        
    };
    return getPriority(a) - getPriority(b);
  });



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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-8 border rounded-md"
          />
        </div>
        <div>
          <Button onClick={exportToExcel}>Export to Excel</Button>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <>
            {/* Display the total user count */}
            <p className="mt-4 text-sm">
              {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found
            </p>

            {/* Table for displaying users */}
            <Table className="min-w-full">
              <TableHeader> 
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  {loggedInUser?.isSuperAdmin && <TableHead>Change Role</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      {user.isSuperAdmin ? (
                        <span className="text-green-500 font-bold">Super Admin</span>
                      ) : user.isAdmin ? (
                        <span className="text-blue-500 font-bold">Admin</span>
                      ) : (
                        <span className="text-gray-500">User</span>
                      )}
                    </TableCell>
                    {loggedInUser?.isSuperAdmin && (
                      <TableCell>
                        <select
                          value={
                            user.isSuperAdmin
                              ? "superadmin"
                              : user.isAdmin
                              ? "admin"
                              : "user"
                          }
                          onChange={(e) =>
                            updateRole(
                              user._id,
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
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
