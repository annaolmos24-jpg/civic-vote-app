interface Props {
  officeUrl?: string | null;
}

// Shown on every results screen (PRD: accuracy requirement).
export default function VerifyNotice({ officeUrl }: Props) {
  return (
    <p className="rounded-lg border-l-4 border-amber-600 bg-amber-50 p-3 text-sm text-slate-800">
      Information can change. Always confirm with your local election office
      {officeUrl ? (
        <>
          {" "}
          (
          <a href={officeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            visit their website
          </a>
          )
        </>
      ) : null}
      .
    </p>
  );
}
