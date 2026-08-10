import RhPageShell from "@/app/components/rh-page-shell";
import RhSubpageHeader from "@/app/components/rh-subpage-header";

const projects = [
  { id: "cybertruck-jeep", label: "cybertruck jeep" },
  { id: "gumball-machine", label: "gumball machine" },
];

export default function ThreeDModellingPage() {
  return (
    <RhPageShell
      activeContentId="3d-modelling"
      contentsItems={projects.map((project, index) => ({
        id: project.id,
        label: (
          <>
            <span className="rh-clink-num">{String(index + 1).padStart(2, "0")}</span>
            {project.label}
          </>
        ),
        href: `/blog/3d-modelling/${project.id}`,
      }))}
    >
      <RhSubpageHeader title="3d modelling" />

      <section className="section" id="3d-modelling" style={{ marginTop: 46 }}>
        <p className="muted">
          these are my 3d modelling projects, designed and assembled in SolidWorks. click a project
          title from contents to view it.
        </p>
      </section>
    </RhPageShell>
  );
}
