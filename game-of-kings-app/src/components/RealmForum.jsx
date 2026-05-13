export default function RealmForum({
  forumPoints,
  forumInput,
  setForumInput,
  submitForumPost,
  forumPosts,
}) {

  return (
    <div className="max-w-5xl mx-auto px-6 pb-10">

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-2xl font-black">
            Realm Forums
          </h2>

          <div className="text-emerald-400 font-bold">
            Forum Points: {forumPoints}
          </div>

        </div>

        <div className="flex gap-4 mb-6">

          <input
            value={forumInput}
            onChange={(e) => setForumInput(e.target.value)}
            placeholder="Address the realm..."
            className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3"
          />

          <button
            onClick={submitForumPost}
            className="bg-emerald-700 hover:bg-emerald-800 transition px-6 rounded-xl font-bold"
          >
            Post
          </button>

        </div>

        <div className="space-y-4">

          {forumPosts.map((post, index) => (

            <div
              key={index}
              className="bg-black/50 border border-zinc-800 rounded-xl p-4"
            >

              <p className="text-zinc-300">
                {post.text}
              </p>

              <p className="text-zinc-500 text-sm mt-2">
                — {post.author}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}