"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Users } from "lucide-react";
import api from "@/lib/axios";

export default function DashboardView() {
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);
  const [entertainmentRevenue, setEntertainmentRevenue] = useState(0);
  const [otherEvents, setOtherEvents] = useState([]);

  const loggedInUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const isSuperAdmin = loggedInUser?.isSuperAdmin || false;

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [eventsResponse, usersResponse] = await Promise.all([
          api.get("/events"),
          api.get("/users"),
        ]);

        const events = eventsResponse.data.data.events.filter(event => !event.isDeleted) || [];
        setTotalEvents(events.length);

        let totalTeamsCount = 0;
        let totalRevenue = 0;
        let entertainmentTotal = 0;
        let otherEventsList = [];

        const teamsPromises = events.map(async (event) => {
          const teamsResponse = await api.post("/event/teams", { eventId: event._id });
          const teams = teamsResponse.data.data.teams.filter(team => team.isVerified) || [];
          const teamsCount = teams.length;

          totalTeamsCount += teamsCount;
          const eventRevenue = teamsCount * event.fees;
          totalRevenue += eventRevenue;

          if (event.name.toLowerCase().includes("entertainment eve")) {
            entertainmentTotal += eventRevenue;
          } else {
            otherEventsList.push({
              name: event.name,
              teams: teamsCount,
              price: event.fees,
              total: eventRevenue,
            });
          }
        });

        // Wait for all team data to be fetched
        await Promise.all(teamsPromises);

        setTotalTeams(totalTeamsCount);
        setTotalMoney(totalRevenue);
        setEntertainmentRevenue(entertainmentTotal);
        setOtherEvents(otherEventsList);

        setTotalUsers(usersResponse.data.data?.users?.length || 0);
      } catch (error) {
        
      }
    };

    fetchDashboardStats();
  }, []);
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
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Endeavour'25 Dashboard</h2>
      <p>Check the total number of active events, teams, users, and total revenue.</p>

      {isSuperAdmin && (
        <Card className="bg-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-700 mb-4">₹{totalMoney}</div>
            
            <div className="space-y-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">🎭 Entertainment Eve Revenue</h3>
                <p className="text-2xl font-bold text-blue-600">₹{entertainmentRevenue}</p>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2">📌 Other Events Revenue</h3>
                <div className="space-y-2">
                  {otherEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {otherEvents.map(({ name, teams, price, total }, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-md"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-blue-900">{name}</h4>
                            <span className="text-sm font-medium text-blue-700 bg-blue-200 px-2 py-0.5 rounded">
                              ₹{price} / team
                            </span>
                          </div>
                          <div className="text-gray-800 text-sm">
                            <p>
                              Teams Participated:{" "}
                              <span className="font-semibold text-blue-700">{teams}</span>
                            </p>
                            <p>
                              Total Revenue:{" "}
                              <span className="font-bold text-green-700 text-base">₹{total}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No revenue data available.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEvents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeams}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
