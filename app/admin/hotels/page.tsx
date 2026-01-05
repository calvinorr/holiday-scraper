"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HotelTableSkeleton } from "@/components/Skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Building2,
  Star,
  MapPin,
  Search,
} from "lucide-react";

interface Hotel {
  id: number;
  name: string;
  destination: string;
  country: string | null;
  resort: string | null;
  rating: number | null;
  description: string | null;
  imageUrl: string | null;
  amenities: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HotelFormData {
  name: string;
  destination: string;
  country: string;
  resort: string;
  rating: string;
  description: string;
  imageUrl: string;
  amenities: string;
  address: string;
}

const emptyForm: HotelFormData = {
  name: "",
  destination: "",
  country: "",
  resort: "",
  rating: "",
  description: "",
  imageUrl: "",
  amenities: "",
  address: "",
};

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState<HotelFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Hotel | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Messages
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  async function fetchHotels() {
    try {
      const res = await fetch(`/api/hotels?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setHotels(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingHotel(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(hotel: Hotel) {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      destination: hotel.destination,
      country: hotel.country || "",
      resort: hotel.resort || "",
      rating: hotel.rating?.toString() || "",
      description: hotel.description || "",
      imageUrl: hotel.imageUrl || "",
      amenities: hotel.amenities ? JSON.parse(hotel.amenities).join(", ") : "",
      address: hotel.address || "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingHotel(null);
    setFormData(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: formData.name,
        destination: formData.destination,
        country: formData.country || null,
        resort: formData.resort || null,
        rating: formData.rating || null,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        amenities: formData.amenities
          ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : null,
        address: formData.address || null,
      };

      const url = editingHotel ? `/api/hotels/${editingHotel.id}` : "/api/hotels";
      const method = editingHotel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: editingHotel ? "Hotel updated successfully" : "Hotel created successfully",
        });
        closeModal();
        fetchHotels();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save hotel" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/hotels/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Hotel deleted successfully" });
        setDeleteConfirm(null);
        fetchHotels();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete hotel" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setDeleting(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    fetchHotels();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Header
        title="Manage Hotels"
        showBack
        rightContent={
          <button
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Hotel
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hotels..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Hotels List */}
        {loading ? (
          <HotelTableSkeleton count={5} />
        ) : hotels.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Building2 className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No hotels found.</p>
            <p className="text-sm mt-1">Click &quot;Add Hotel&quot; to create one.</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                  <th className="px-4 py-3 font-medium">Hotel</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Rating</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr
                    key={hotel.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {hotel.imageUrl ? (
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-zinc-500 md:hidden">
                            {hotel.destination}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        {hotel.destination}
                        {hotel.country && `, ${hotel.country}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {hotel.rating ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {hotel.rating}
                        </div>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(hotel)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(hotel)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-medium">
                {editingHotel ? "Edit Hotel" : "Add Hotel"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Destination <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g., Tenerife"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., Spain"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Resort</label>
                  <input
                    type="text"
                    value={formData.resort}
                    onChange={(e) => setFormData({ ...formData, resort: e.target.value })}
                    placeholder="e.g., Costa Adeje"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amenities <span className="text-zinc-500 text-xs">(comma separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Pool, WiFi, Spa, Gym"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingHotel ? (
                    "Update Hotel"
                  ) : (
                    "Create Hotel"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-medium mb-2">Delete Hotel</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
