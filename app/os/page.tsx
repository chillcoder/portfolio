import { Desktop } from "@/components/os/Desktop";
import { MenuBar } from "@/components/os/MenuBar";
import { Taskbar } from "@/components/os/Taskbar";
import { WindowManager } from "@/components/os/WindowManager";

export default function OsPage() {
  return (
    <Desktop>
      <MenuBar />
      <WindowManager />
      <Taskbar />
    </Desktop>
  );
}
