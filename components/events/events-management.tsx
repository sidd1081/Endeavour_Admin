"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash, Download } from "lucide-react";

interface Prize {
  position: string;
  amount: number;
}

interface FAQ {
  ques: string;
  ans: string;
}

interface Event {
  isDeleted: boolean;
  _id?: string;
  slug?: string;
  name: string;
  description: string;
  discount?: string;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStartDate: string;
  registrationEndDate: string;
  eventDate?: string;
  fees: number;
  prize: Prize[];
  poster?: string;
  qrcode?: string;
  faq: FAQ[];
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const [form, setForm] = useState<Event>({
    isDeleted: false,
    name: "",
    description: "",
    discount: "",
    minTeamSize: 1,
    maxTeamSize: 1,
    registrationStartDate: "",
    registrationEndDate: "",
    eventDate: "",
    fees: 0,
    prize: [{ position: "1", amount: 0 }],
    poster: "",
    qrcode: "",
    faq: [{ ques: "", ans: "" }],
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data.data.events.filter(event => !event.isDeleted));
      } catch (error) {
       
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFaqChange = (index: number, field: "ques" | "ans", value: string) => {
    const updatedFaq = [...form.faq];
    updatedFaq[index][field] = value;
    setForm({ ...form, faq: updatedFaq });
  };

  const addFaq = () => {
    setForm({ ...form, faq: [...form.faq, { ques: "", ans: "" }] });
  };

  const removeFaq = (index: number) => {
    const updatedFaq = form.faq.filter((_, i) => i !== index);
    setForm({ ...form, faq: updatedFaq });
  };

  const handlePrizeChange = (index: number, field: "position" | "amount", value: string) => {
    const updatedPrizes = [...form.prize];
    if (field === "amount") {
      updatedPrizes[index][field] = Number(value);
    } else {
      updatedPrizes[index][field] = value;
    }
    setForm({ ...form, prize: updatedPrizes });
  };

  const addPrize = () => {
    setForm({ ...form, prize: [...form.prize, { position: "", amount: 0 }] });
  };

  const removePrize = (index: number) => {
    const updatedPrizes = form.prize.filter((_, i) => i !== index);
    setForm({ ...form, prize: updatedPrizes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.minTeamSize > form.maxTeamSize) {
      alert("Max Team Size must be greater than or equal to Min Team Size.");
      return;
    }
    if (
      new Date(form.registrationEndDate) <= new Date(form.registrationStartDate)
    ) {
      alert("Registration End Date must be after the Start Date.");
      return;
    }
    if (
      form.eventDate &&
      new Date(form.eventDate) <= new Date(form.registrationEndDate)
    ) {
      alert("Event Date must be after the Registration End Date.");
      return;
    }

    try {
      if (currentEvent) {
        await api.put(`/events/${currentEvent.slug}`, form);
      } else {
        await api.post("/events", form);
      }

      setIsDialogOpen(false);
      location.reload();
    } catch (error) {
      
      alert("Failed to save event. Please check your input.");
    }
  };

  const deleteEvent = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.put(`/events/${slug}`, { isDeleted: true });
      setEvents(prevEvents =>
        prevEvents
          .map(event =>
            event.slug === slug ? { ...event, isDeleted: true } : event
          )
          .filter(event => !event.isDeleted)
      );
    } catch (error) {
      
    }
  };

  const exportToCSV = () => {
    if (events.length === 0) {
      alert("No event data to export.");
      return;
    }

    const header = [
      "Name,Min Team Size,Max Team Size,Fees,Registration Start,Registration End,Event Date",
    ];
    const rows = events.map(
      event =>
        `${event.name},${event.minTeamSize},${event.maxTeamSize},${event.fees},${event.registrationStartDate},${event.registrationEndDate},${event.eventDate || "N/A"}`
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "events.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Event Management</h1>

      <div className="flex gap-4 mt-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentEvent ? "Edit" : "Add"} Event</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Label>Name</Label>
              <Input type="text" name="name" value={form.name} onChange={handleChange} required />

              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} />

              <Label>Discount</Label>
              <Input type="text" name="discount" value={form.discount} onChange={handleChange} />

              <Label>Min Team Size</Label>
              <Input type="number" name="minTeamSize" value={form.minTeamSize} onChange={handleChange} required />

              <Label>Max Team Size</Label>
              <Input type="number" name="maxTeamSize" value={form.maxTeamSize} onChange={handleChange} required />

              <Label>Fees</Label>
              <Input type="number" name="fees" value={form.fees} onChange={handleChange} required />

              <Label>Registration Start Date</Label>
              <Input type="date" name="registrationStartDate" value={form.registrationStartDate} onChange={handleChange} />

              <Label>Registration End Date</Label>
              <Input type="date" name="registrationEndDate" value={form.registrationEndDate} onChange={handleChange} />

              <Label>Event Date</Label>
              <Input type="date" name="eventDate" value={form.eventDate || ""} onChange={handleChange} />

              <Label>Poster Image URL</Label>
              <Input type="text" name="poster" value={form.poster} onChange={handleChange} required />

              <Label>QR Code Image URL</Label>
              <Input type="text" name="qrcode" value={form.qrcode} onChange={handleChange} required />

              {/* Prize Section */}
              <div>
                <Label className="text-lg">Prize Distribution</Label>
                {form.prize.map((prize, index) => (
                  <div key={index} className="border p-3 mb-2 rounded">
                    <Input
                      type="text"
                      placeholder="Position"
                      value={prize.position}
                      onChange={(e) => handlePrizeChange(index, "position", e.target.value)}
                      className="mb-2"
                    />
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={prize.amount}
                      onChange={(e) => handlePrizeChange(index, "amount", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removePrize(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addPrize} className="mt-2">
                  + Add Prize
                </Button>
              </div>

              {/* FAQ Section */}
              <div>
                <Label className="text-lg">FAQs</Label>
                {form.faq.map((faq, index) => (
                  <div key={index} className="border p-3 mb-2 rounded">
                    <Input
                      type="text"
                      placeholder="Question"
                      value={faq.ques}
                      onChange={(e) => handleFaqChange(index, "ques", e.target.value)}
                      className="mb-2"
                    />
                    <Textarea
                      placeholder="Answer"
                      value={faq.ans}
                      onChange={(e) => handleFaqChange(index, "ans", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => removeFaq(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addFaq} className="mt-2">
                  + Add FAQ
                </Button>
              </div>

              <DialogFooter>
                <Button type="submit">
                  {currentEvent ? "Update" : "Create"} Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Button onClick={exportToCSV} className="bg-green-500 hover:bg-green-600">
          <Download className="mr-2" /> Export to CSV
        </Button>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                
                <TableHead>Team Size</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(event => (
                <TableRow key={event._id}>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="p-0 text-left text-blue-600 hover:underline">
                          {event.name}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{event.name} - Full Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          <p><strong>Description:</strong> {event.description}</p>
                          <p><strong>Discount:</strong> {event.discount || "None"}</p>
                          <p><strong>Team Size:</strong> {event.minTeamSize} - {event.maxTeamSize}</p>
                          <p><strong>Fees:</strong> ₹{event.fees}</p>
                          <p><strong>Registration:</strong> {event.registrationStartDate} to {event.registrationEndDate}</p>
                          <p><strong>Event Date:</strong> {event.eventDate || "N/A"}</p>
                          <p><strong>Poster:</strong> <a href={event.poster} target="_blank" className="text-blue-500 underline">View Poster</a></p>
                          <p><strong>QR Code:</strong> <a href={event.qrcode} target="_blank" className="text-blue-500 underline">View QR</a></p>
                          <div>
                            <strong>Prizes:</strong>
                            <ul className="list-disc list-inside">
                              {event.prize.map((p, i) => (
                                <li key={i}><strong>{p.position}:</strong> ₹{p.amount}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>FAQs:</strong>
                            {event.faq.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {event.faq.map((faq, i) => (
                                  <li key={i}><strong>Q:</strong> {faq.ques}<br /><strong>A:</strong> {faq.ans}</li>
                                ))}
                              </ul>
                            ) : <p className="ml-4">No FAQs</p>}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>

                  <TableCell>{event.minTeamSize} - {event.maxTeamSize}</TableCell>
                  <TableCell>₹{event.fees}</TableCell>
                  <TableCell>{event.registrationStartDate} - {event.registrationEndDate}</TableCell>
                  <TableCell>{event.eventDate || "N/A"}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setCurrentEvent(event);
                        setForm(event);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit /> Edit
                    </Button>
                    <Button onClick={() => deleteEvent(event.slug!)} className="ml-2">
                      <Trash /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
