export default function RealmChronicle({ warLog }) {

  return (
    <div className="max-w-5xl mx-auto px-6 pb-16">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <h2 className="text-2xl font-black mb-4">
          Realm Chronicle
        </h2>

        <div className="space-y-3 max-h-72 overflow-y-auto">

          {warLog.map((entry, index) => (

            <div
              key={index}
              className="border border-zinc-800 bg-black/50 rounded-xl p-3 text-zinc-300"
            >
              {entry}
            </div>

          ))}

        </div>

      </div>

    </div>
  );
}