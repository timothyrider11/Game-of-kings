export default function Home() {
return (
<main className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-6">

<h1 className="text-6xl md:text-8xl font-bold tracking-wide mb-6">
GAME OF KINGS
</h1>

<p className="text-xl md:text-2xl max-w-2xl text-gray-300 mb-10">
Forge your house. Claim your castle. Conquer the realm.
</p>

<div className="flex gap-4 flex-wrap justify-center">
<button className="bg-yellow-600 hover:bg-yellow-500 px-8 py-4 rounded-xl text-lg font-semibold transition">
Join the Realm
</button>

<button className="border border-gray-500 hover:border-white px-8 py-4 rounded-xl text-lg transition">
View the Map
</button>
</div>

</main>
);
}
git add .
git commit -m "Added Game of Kings homepage"
