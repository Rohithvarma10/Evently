import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

const CreateEventForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    capacity: '',
    image: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/api/events/create', formData);

      toast.success('✅ Event created!');
      onSuccess(); // Refresh events list or close form
      setFormData({ title: '', date: '', location: '', capacity: '', image: '' });
    } catch (err) {
      console.error('❌ Create Event Error:', err);
      toast.error('❌ Failed to create event');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="datetime-local"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          name="location"
          required
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Capacity</label>
        <input
          type="number"
          name="capacity"
          required
          value={formData.capacity}
          onChange={handleChange}
          className="mt-1 block w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          type="text"
          name="image"
          required
          value={formData.image}
          onChange={handleChange}
          className="mt-1 block w-full border p-2 rounded"
        />
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Event
        </button>
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm;
