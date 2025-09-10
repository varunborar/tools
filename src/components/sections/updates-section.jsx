"use client";
import * as React from "react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function UpdatesSection({ updatesData, pageSize = 10, title = "Updates", subtitle = "Latest changes" }) {
  const items = updatesData?.updates ?? [];
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  React.useEffect(() => {
    // Clamp page if the number of items or pageSize changes
    const newTotal = Math.max(1, Math.ceil(items.length / pageSize));
    if (page > newTotal) setPage(newTotal);
  }, [items.length, pageSize, page]);

  const goPrev = React.useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = React.useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <div className="text-sm opacity-70">No updates yet.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2">
            {visible.map((u, idx) => (
              <Link key={`${u.title}-${start + idx}`} href={u.link} target={u.link?.startsWith("http") ? "_blank" : undefined} className="group">
                <div className="border rounded-lg px-4 py-3 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{u.title}</div>
                      <div className="text-sm text-muted-foreground">{u.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">{u.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <Pagination className="mt-3">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goPrev(); }} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goNext(); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </>
      )}
    </section>
  );
}
