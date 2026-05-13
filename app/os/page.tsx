import { Desktop } from "@/components/os/Desktop";
import { MenuBar } from "@/components/os/MenuBar";
import { Taskbar } from "@/components/os/Taskbar";

export default function OsPage() {
  return (
    <Desktop>
      <MenuBar />
      <Taskbar />
    </Desktop>
  );
}
