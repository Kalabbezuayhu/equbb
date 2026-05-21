import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20",
      className
    )}
    {...props}
  />
);
