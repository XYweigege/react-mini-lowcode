import { CommonComponentProps } from "../../interface";
import { useMaterailDrop } from "../../hook/useMaterialDrop";

function Page({ id, name, children }: CommonComponentProps) {
  console.log(id, name, "id,name");

  const { canDrop, drop } = useMaterailDrop(["Button", "Container"], id);

  return (
    <div
      data-component-id={id}
      ref={drop}
      className="p-[20px] h-[100%] box-border"
      style={{ border: canDrop ? "2px solid blue" : "none" }}
    >
      {children}
    </div>
  );
}

export default Page;
