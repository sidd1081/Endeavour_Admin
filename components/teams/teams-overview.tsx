"use client"

import type React from "react"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { Checkbox } from "@/components/ui/checkbox"

interface Team {
  _id: string
  eventId: string
  eventName: string
  leaderId: string
  teamName: string
  createdAt: string
  members: string[]
  isRegistered: boolean
  isVerified: boolean
  teamCode: string
  paymentScreenshot?: string
  paymentTransactionId?: string
}

interface Event {
  _id: string
  name: string
  slug: string
}

interface User {
  _id: string
  name: string
  email: string
}

export default function TeamsOverview() {
  // Teams overview state
  const [events, setEvents] = useState<Event[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New Team Creation state
  const [newTeamOpen, setNewTeamOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [newTeamData, setNewTeamData] = useState({
    teamName: "",
    eventId: "",
    eventSlug: "",
    leaderId: "",
    isVerified: true,
  })
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [eventSearchQuery, setEventSearchQuery] = useState("")

  // State for all users (for displaying names in the teams table)
  const [allUsers, setAllUsers] = useState<User[]>([])

  // State for Add Member dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [memberSearchQuery, setMemberSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState("")

  // State for Payment Screenshot dialog
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false)
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  // State for verification confirmation dialog
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)

  // Fetch events and teams for overview
  useEffect(() => {
    const fetchAllTeams = async () => {
      setLoading(true)
      setError(null)
      try {
        const eventsResponse = await api.get("/events")
        console.log("Fetched Events:", eventsResponse.data)
        const eventsList = eventsResponse.data?.data?.events || []
        setEvents(eventsList)

        let allTeams: Team[] = []
        for (const event of eventsList) {
          const teamsResponse = await api.post("/event/teams", { eventId: event._id })
          console.log(`Fetched Teams for ${event.name}:`, teamsResponse.data)
          const teamsFromEvent = teamsResponse.data?.data?.teams || []
          allTeams = [
            ...allTeams,
            ...teamsFromEvent.map((team) => ({
              ...team,
              isRegistered: Boolean(team.isRegistered),
              eventName: event.name,
            })),
          ]
        }
        console.log("All Teams:", allTeams)
        setTeams(allTeams)
        setFilteredTeams(allTeams)
      } catch (error) {
        console.error("Error fetching teams:", error)
        setError("Failed to fetch teams. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchAllTeams()
  }, [])

  // Fetch users for both team creation and table display
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users")
        console.log("Fetched Users:", res.data)
        const usersList = res.data?.data?.users || []
        setUsers(usersList)
        setAllUsers(usersList)

        // Log to verify we have user data
        console.log("User data loaded:", usersList.length, "users")
      } catch (error) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load user data")
      }
    }
    fetchUsers()
  }, [])

  // Filter teams based on selected event and search query
  useEffect(() => {
    let filtered = [...teams] // Create a new array to avoid mutation issues

    if (selectedEventId) {
      filtered = filtered.filter((team) => team.eventId === selectedEventId)
    }

    if (searchQuery) {
      filtered = filtered.filter((team) => team.teamName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    console.log("Filtering teams:", {
      total: teams.length,
      filtered: filtered.length,
      eventId: selectedEventId,
      query: searchQuery,
    })

    setFilteredTeams(filtered)
  }, [selectedEventId, searchQuery, teams])

  // Filtered lists for modal search
  const filteredUsers = users.filter(
    (user) =>
      user._id.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()),
  )
  const filteredEvents = events.filter(
    (event) =>
      event._id.toLowerCase().includes(eventSearchQuery.toLowerCase()) ||
      event.name.toLowerCase().includes(eventSearchQuery.toLowerCase()),
  )

  // Filtered users for Add Member dialog
  const filteredUsersForMember = users.filter(
    (user) =>
      user._id.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()),
  )

  // Handlers for new team data changes
  const handleNewTeamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTeamData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const selectedEvent = events.find((ev) => ev._id === selectedId)
    setNewTeamData((prev) => ({ ...prev, eventId: selectedId, eventSlug: selectedEvent ? selectedEvent.slug : "" }))
  }

  // Handler for submitting new team creation form
  const handleNewTeamSubmit = async () => {
    try {
      await api.post("/addTeam", newTeamData)
      toast.success("Team created successfully!")
      setNewTeamOpen(false)
      // Optionally, refresh the teams list here
    } catch (error) {
      console.error("Error creating team:", error)
      toast.error("Error creating team")
    }
  }

  // Handler for opening the Add Member dialog
  const openAddMemberDialog = (team: Team) => {
    setSelectedTeam(team)
    setSelectedMember("")
    setMemberSearchQuery("")
    setAddMemberOpen(true)
  }

  // Handler for submitting the Add Member form
  const handleAddMemberSubmit = async () => {
    if (!selectedMember || !selectedTeam) {
      toast.error("Please select a user to add.")
      return
    }
    try {
      const payload = {
        userId: selectedMember,
        teamCode: selectedTeam.teamCode,
      }
      const res = await api.post("/joinTeam", payload)
      if (res.data.success) {
        toast.success("Team member added successfully")
        setAddMemberOpen(false)
      } else {
        toast.error("Failed to add team member")
      }
    } catch (error) {
      toast.error("Error adding team member")
      console.error("Error joining team:", error)
    }
  }

  // Handler for opening the Screenshot dialog
  const openScreenshotDialog = (team: Team) => {
    setCurrentScreenshot(team.paymentScreenshot || null)
    setCurrentTransactionId(team.paymentTransactionId || null)
    setScreenshotDialogOpen(true)
  }

  // Handler for updating verification status
  const updateVerificationStatus = async (teamId: string, isVerified: boolean) => {
    try {
      // Call the API to update the verification status
      const response = await api.post("/event/teams", {
        teamId,
        isVerified,
        eventId: teams.find((team) => team._id === teamId)?.eventId,
        action: "updateVerification", // Add an action parameter to specify the operation
      })

      if (response.data.success) {
        // Update the local state only after successful backend update
        setTeams((prevTeams) => prevTeams.map((team) => (team._id === teamId ? { ...team, isVerified } : team)))

        // Update filtered teams as well to ensure UI consistency
        setFilteredTeams((prevTeams) => prevTeams.map((team) => (team._id === teamId ? { ...team, isVerified } : team)))

        toast.success(`Team verification status updated to ${isVerified ? "verified" : "not verified"}`)
      } else {
        toast.error("Failed to update verification status on the server")
      }
    } catch (error) {
      console.error("Error updating verification status:", error)
      toast.error("Failed to update verification status. Please try again.")
    }
  }

  // Helper function to get user's name by ID
  const getUserName = (userId: string) => {
    const user = allUsers.find((u) => u._id === userId)
    return user ? user.name : userId
  }

  return (
    <div className="h-screen w-full flex flex-col p-6">
      <h1 className="text-2xl font-bold text-center">Teams Overview</h1>

      {/* Create New Team Button */}
      <div className="flex justify-end my-4">
        <Button onClick={() => setNewTeamOpen(true)}>Create New Team</Button>
      </div>

      {/* New Team Creation Dialog */}
      <Dialog open={newTeamOpen} onOpenChange={setNewTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Team</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-medium mb-1">Team Name</label>
              <Input
                name="teamName"
                placeholder="Team Name"
                value={newTeamData.teamName}
                onChange={handleNewTeamChange}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Select Leader</label>
              <Input
                type="text"
                placeholder="Search leader by ID or name"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="mb-2"
              />
              <select
                name="leaderId"
                className="w-full p-2 border rounded-md bg-white text-black"
                value={newTeamData.leaderId}
                onChange={handleNewTeamChange}
              >
                <option value="">-- Select Leader --</option>
                {filteredUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user._id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1">Select Event</label>
              <Input
                type="text"
                placeholder="Search event by ID or name"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                className="mb-2"
              />
              <select
                name="eventId"
                className="w-full p-2 border rounded-md bg-white text-black"
                value={newTeamData.eventId}
                onChange={handleEventSelect}
              >
                <option value="">-- Select Event --</option>
                {filteredEvents.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name} ({event._id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleNewTeamSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="block font-medium mb-1">Select User to Add</label>
            <Input
              type="text"
              placeholder="Search user by ID or name"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="mb-2"
            />
            <select
              className="w-full p-2 border rounded-md bg-white text-black"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {filteredUsersForMember.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user._id})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMemberSubmit}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Screenshot Dialog */}
      <Dialog open={screenshotDialogOpen} onOpenChange={setScreenshotDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {currentScreenshot ? (
              <div className="w-full">
                <img
                  src={currentScreenshot || "/placeholder.svg"}
                  alt="Payment Screenshot"
                  className="w-full h-auto max-h-[400px] object-contain border rounded"
                />
                {currentTransactionId && (
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">Transaction ID:</span> {currentTransactionId}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center p-8 border rounded w-full">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Confirmation Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Verification</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>You are changing the status of team "{selectedTeam?.teamName}" to TRUE</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedTeam) {
                  try {
                    const response = await api.patch(`/teams/verify/${selectedTeam.teamCode}`)
                    if (response.data.success) {
                      // Update local state
                      setTeams((prevTeams) =>
                        prevTeams.map((team) => (team._id === selectedTeam._id ? { ...team, isVerified: true } : team)),
                      )
                      setFilteredTeams((prevTeams) =>
                        prevTeams.map((team) => (team._id === selectedTeam._id ? { ...team, isVerified: true } : team)),
                      )
                      toast.success("Team verified successfully")
                    } else {
                      toast.error("Failed to verify team")
                    }
                  } catch (error) {
                    console.error("Error verifying team:", error)
                    toast.error("Error verifying team")
                  }
                  setVerificationDialogOpen(false)
                }
              }}
            >
              Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filtering options for teams overview */}
      <div className="mt-4 flex flex-col md:flex-row gap-4 w-full">
        <div className="flex-1">
          <label className="block font-medium">Select Event</label>
          <select
            className="w-full p-2 border rounded-md bg-white text-black"
            onChange={(e) => setSelectedEventId(e.target.value || null)}
          >
            <option value="">-- Show All Teams --</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block font-medium">Search Team</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by team name"
              className="w-full p-2 pl-10 border rounded-md bg-white text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {/* Teams Table */}
      <div className="mt-6 flex-grow overflow-auto">
        {loading ? (
          <p className="text-center">Loading teams...</p>
        ) : filteredTeams.length === 0 ? (
          <p className="text-center">No teams found.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-full w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Leader</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team._id}>
                    <TableCell>{team.teamName}</TableCell>
                    <TableCell>{team.eventName}</TableCell>
                    <TableCell>{getUserName(team.leaderId)}</TableCell>
                    <TableCell>
                      {team.members.length > 0 ? (
                        team.members.map((memberId) => <div key={memberId}>{getUserName(memberId)}</div>)
                      ) : (
                        <span>No members</span>
                      )}
                    </TableCell>
                    <TableCell>{team.isRegistered ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      {team.isVerified ? (
                        <span className="text-green-600 font-medium">Verified</span>
                      ) : (
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => {
                            setSelectedTeam(team)
                            setVerificationDialogOpen(true)
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openScreenshotDialog(team)}>
                        Show SS
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => openAddMemberDialog(team)}>Add Member</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
