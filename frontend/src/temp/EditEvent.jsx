import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Zod schema
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z
    .number({ invalid_type_error: 'Capacity must be a number' })
    .min(1, 'Capacity must be at least 1'),
  date: z.string().min(1, 'Date is required'),
  image: z.string().url('Image must be a valid URL'),
});

const EditEvent = ({ event, onClose }) => {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title || '',
      location: event?.location || '',
      capacity: event?.capacity || 1,
      date: new Date(event?.date).toISOString().slice(0, 16),
      image: event?.image || '',
    },
  });

  const { mutate, isLoading, isError, isSuccess, error } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axios.put(
        `https://5bec41ab-8071-4f15-8f8e-863807d07b11-00-2a0a15julymht.janeway.replit.dev/api/events/${event._id}`,
        {
          ...updatedData,
          date: new Date(updatedData.date).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-events']);
      onClose();
    },
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <div className="bg-white border p-6 rounded shadow max-w-md mx-auto mt-6">
      <h3 className="text-xl font-semibold mb-4">✏️ Edit Event</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            {...register('location')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium">Capacity</label>
          <input
            type="number"
            {...register('capacity', { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium">Date & Time</label>
          <input
            type="datetime-local"
            {...register('date')}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input
            type="text"
            {...register('image')}
            className="w-full border px-3 py-2 rounded"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 underline"
          >
            Cancel
          </button>
        </div>

        {/* Messages */}
        {isError && (
          <p className="text-red-500 text-sm mt-2">
            {error?.response?.data?.msg || 'Something went wrong'}
          </p>
        )}
        {isSuccess && (
          <p className="text-green-600 text-sm mt-2">✅ Event updated successfully!</p>
        )}
      </form>
    </div>
  );
};

export default EditEvent;
