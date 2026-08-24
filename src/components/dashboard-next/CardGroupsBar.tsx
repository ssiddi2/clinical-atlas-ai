import { useState } from "react";
import { Bookmark, FolderPlus, Layers, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CardGroup } from "./useCardGroups";

export type CardFilter = { kind: "all" } | { kind: "bookmarked" } | { kind: "group"; id: string };

interface Props {
  groups: CardGroup[];
  filter: CardFilter;
  bookmarkCount: number;
  countFor: (groupId: string) => number;
  onFilter: (filter: CardFilter) => void;
  onCreate: (name: string) => void;
  onRemove: (id: string) => void;
}

/** Filter chips for the card board: everything, bookmarks, or a named group. */
const CardGroupsBar = ({ groups, filter, bookmarkCount, countFor, onFilter, onCreate, onRemove }: Props) => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
    }`;

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name);
    setName("");
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button className={chip(filter.kind === "all")} onClick={() => onFilter({ kind: "all" })}>
        <Layers className="h-3.5 w-3.5" /> All
      </button>
      <button className={chip(filter.kind === "bookmarked")} onClick={() => onFilter({ kind: "bookmarked" })}>
        <Bookmark className="h-3.5 w-3.5" /> Saved{bookmarkCount > 0 ? ` · ${bookmarkCount}` : ""}
      </button>
      {groups.map((g) => {
        const active = filter.kind === "group" && filter.id === g.id;
        return (
          <span key={g.id} className="inline-flex items-center">
            <button className={chip(active)} onClick={() => onFilter({ kind: "group", id: g.id })}>
              {g.name}
              {countFor(g.id) > 0 && <span className="opacity-70">· {countFor(g.id)}</span>}
              {active && (
                <X
                  className="h-3 w-3 ml-0.5 opacity-80 hover:opacity-100"
                  role="button"
                  aria-label={`Delete group ${g.name}`}
                  onClick={(e) => { e.stopPropagation(); onRemove(g.id); onFilter({ kind: "all" }); }}
                />
              )}
            </button>
          </span>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full h-8 text-muted-foreground">
            <FolderPlus className="h-3.5 w-3.5 mr-1.5" /> New group
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <p className="text-sm font-medium mb-2">Name your study group</p>
          <div className="flex gap-1.5">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. Step 2 sprint"
              className="h-9"
            />
            <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={submit} aria-label="Create group">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CardGroupsBar;
