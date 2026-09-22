import { Link } from "react-router-dom";
import { Item } from "../types/Item";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  claimed: "bg-slate-200 text-slate-600",
};

const typeStyles: Record<string, string> = {
  lost: "bg-red-50 text-red-600 border border-red-200",
  found: "bg-emerald-50 text-emerald-600 border border-emerald-200",
};

interface Props {
  item: Item;
  showStatus?: boolean;
}

const ItemCard = ({ item, showStatus = false }: Props) => {
  return (
    <Link
      to={`/items/${item._id}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z"
              />
            </svg>
          </div>
        )}
        <span
          className={`badge absolute left-2 top-2 capitalize ${typeStyles[item.type]}`}
        >
          {item.type}
        </span>
        {showStatus && (
          <span className={`badge absolute right-2 top-2 capitalize ${statusStyles[item.status]}`}>
            {item.status}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-800">{item.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
            {item.category}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
