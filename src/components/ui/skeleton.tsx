import { cn } from "~/utils/shadcnuiUtils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
}

function Skeleton({ className, index, ...props }: SkeletonProps) {
  return (
    <div
      style={{ animationDelay: `${index * 0.25}s` }}
      className={cn("animate-pulse rounded-md bg-primary/40", className)}
      {...props}
    />
  );
}

export { Skeleton };
