import { Desktop } from "@/components/os/Desktop";
import { Taskbar } from "@/components/os/Taskbar";
import { WindowManager } from "@/components/os/WindowManager";

export default function OsPage() {
  return (
    <Desktop>
      <WindowManager />
      <Taskbar />
    </Desktop>
  );
}
