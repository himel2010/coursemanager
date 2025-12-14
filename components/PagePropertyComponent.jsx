const PagePropertyComponent = ({ pageProperties }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(pageProperties)?.map(([p, v], j) => (
        <div key={j} className="grid grid-cols-[1fr_4fr]">
          <div>{p}</div>
          <div>{v}</div>
        </div>
      ))}
    </div>
  )
}

export default PagePropertyComponent
