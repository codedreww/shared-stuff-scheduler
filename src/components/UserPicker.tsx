import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/lib/booking";

type UserPickerProps = {
  users: User[];
  userId: string;
  onChange: (userId: string) => void;
};

/** The "Booking as" dropdown. Stands in for a login. */
export function UserPicker({ users, userId, onChange }: UserPickerProps) {
  const items = users.map((user) => ({ value: user.id, label: user.name }));

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="user-picker">Booking as</Label>
      <Select
        items={items}
        value={userId}
        onValueChange={(value) => {
          if (value) onChange(value);
        }}
      >
        <SelectTrigger id="user-picker" className="min-w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
