"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type User = {
  ID_USER: string;
  EMAIL: string;
  NAME?: string;
  COMPANY?: string;
  LANGUAGE?: string;
  IS_ACTIVE?: boolean;
  CREATED_AT?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD USERS
  // =====================================================

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/user/list");
        setUsers(res.users || []);
      } catch (e) {
        console.error("❌ error loading users", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Users
        </h1>

        <Link
          href="/admin/users/create"
          className="bg-ratecard-blue text-white px-4 py-2 rounded-lg text-sm"
        >
          + Create user
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            No users found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Language</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.ID_USER} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.EMAIL}</td>
                  <td className="p-3">{u.NAME || "-"}</td>
                  <td className="p-3">{u.COMPANY || "-"}</td>
                  <td className="p-3">{u.LANGUAGE || "fr"}</td>

                  <td className="p-3">
                    {u.IS_ACTIVE ? (
                      <span className="text-green-600 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/admin/users/${u.ID_USER}`}
                      className="text-ratecard-blue hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
