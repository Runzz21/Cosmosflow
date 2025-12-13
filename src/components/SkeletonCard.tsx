export default function SkeletonCard() {
  return (
    <div className="card-float p-6">
      <div className="skeleton h-8 w-56 mb-4 rounded-lg" />
      <div className="skeleton h-4 w-full mb-2 rounded" />
      <div className="skeleton h-4 w-40 mb-4 rounded" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  )
}