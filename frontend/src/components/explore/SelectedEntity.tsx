import { Image } from "@/components/Image";

export default function SelectedEntity({
  children,
  deselect,
}: {
  children: React.ReactNode;
  deselect: () => void;
}) {
  return (
    <div className="rounded-2xl p-3 bg-lmp-gray3 flex gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm">
      <Image
        src="/assets/x_circle.svg"
        alt="Deselect"
        onClick={() => deselect()}
        width={20}
        height={20}
        className="mr-2"
      />
      {children}
    </div>
  );
}
