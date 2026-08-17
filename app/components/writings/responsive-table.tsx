import { useEffect, useRef, useState, type ReactNode } from "react";

export function ResponsiveTable({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}) {
  const region = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const element = region.current;
    if (element === null) return;

    const measure = () => {
      setOverflowing(element.scrollWidth > element.clientWidth + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      aria-label={label}
      className="article-table-region"
      data-overflow={overflowing ? "true" : "false"}
      ref={region}
      role="region"
      tabIndex={overflowing ? 0 : undefined}
    >
      {children}
    </div>
  );
}
