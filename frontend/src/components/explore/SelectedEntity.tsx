export default function SelectedEntity({
  children,
  deselect,
}: {
  children: React.ReactNode;
  deselect: () => void;
}) {
  return (
    <div className="rounded-2xl p-3 bg-lmp-gray3 flex flex-wrap gap-1 cursor-pointer hover:bg-lmp-gray3/70 transition text-sm">
      <p onClick={() => deselect()}>cross</p>
      {children}
    </div>
  );
}
