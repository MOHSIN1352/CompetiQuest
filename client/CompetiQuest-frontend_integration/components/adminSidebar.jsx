"use client";
import React from "react";

export default function AdminSidebar({
  users = [],
  totalUsers = 0,
  loading = false,
}) {
  return (
    <div className="sticky top-24 space-y-4">
      <div className="bg-white/60 dark:bg-zinc-800 p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Users</h3>
        <p className="text-sm text-muted-foreground">
          Total users: <span className="font-medium">{totalUsers}</span>
        </p>
      </div>

      <div className="bg-white/60 dark:bg-zinc-800 p-4 rounded shadow max-h-96 overflow-auto">
        <h4 className="font-semibold">Active / Recent users</h4>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-500">No users found</p>
        ) : (
          <ul className="space-y-2 mt-3">
            {users.map((u) => (
              <li key={u._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {u.username || u.name || u.email}
                  </div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="text-xs text-gray-400">{u.role || "user"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
