import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, Clock, Star, Filter, Heart, Flame, ChevronRight, Lock } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import BottomNav from "@/components/BottomNav";
import VideoPlayer, { Video } from "@/components/VideoPlayer";
import { useLanguage } from "@/i18n/LanguageContext";

// ─── Catalogue de vraies vidéos YouTube publiques ───────────────────────────
// Remplace les videoId par tes propres vidéos YouTube/Vimeo quand tu en auras
const videos: Video[] = [
  {
    id: "1",
    title: "Full Body Reformer Flow",
    instructor: "Pilates Anytime",
    duration: "45 min",
    level: "Intermédiaire",
    category: "Corps entier",
    description: "Un enchaînement complet sur le Reformer pour travailler tout le corps en douceur. Parfait pour une séance équilibrée alliant force, souplesse et contrôle.",
    thumbnail: "https://img.youtube.com/vi/r0H4V2LKQMU/maxresdefault.jpg",
    source: "youtube",
    videoId: "r0H4V2LKQMU",
    calories: 280,
    equipment: ["Reformer", "Box"],
    rating: 4.9,
    reviews: 1240,
    featured: true,
  },
  {
    id: "2",
    title: "Core & Abs Pilates",
    instructor: "Move with Nicole",
    duration: "20 min",
    level: "Tous niveaux",
    category: "Abdos",
    description: "Renforce ta sangle abdominale avec ces exercices ciblés. Idéal pour sculpter la taille et améliorer ta posture au quotidien.",
    thumbnail: "https://img.youtube.com/vi/g_tea8ZNk5A/maxresdefault.jpg",
    source: "youtube",
    videoId: "g_tea8ZNk5A",
    calories: 150,
    equipment: ["Tapis"],
    rating: 4.8,
    reviews: 3200,
  },
  {
    id: "3",
    title: "Posture & Alignement",
    instructor: "Pilates Fitness",
    duration: "30 min",
    level: "Débutant",
    category: "Posture",
    description: "Corrige ta posture et renforce les muscles stabilisateurs du dos. Une séance douce mais efficace pour soulager les tensions cervicales et lombaires.",
    thumbnail: "https://img.youtube.com/vi/kSdoRUPkYkE/maxresdefault.jpg",
    source: "youtube",
    videoId: "kSdoRUPkYkE",
    calories: 120,
    equipment: ["Tapis", "Élastique"],
    rating: 4.7,
    reviews: 890,
  },
  {
    id: "4",
    title: "Lower Body Sculpt",
    instructor: "Body by Simone",
    duration: "35 min",
    level: "Intermédiaire",
    category: "Tonification",
    description: "Cible les fessiers, les cuisses et les mollets avec des exercices de Pilates adaptés. Résultat : des jambes toniques et une silhouette sculptée.",
    thumbnail: "https://img.youtube.com/vi/Ev6yE55kYGw/maxresdefault.jpg",
    source: "youtube",
    videoId: "Ev6yE55kYGw",
    calories: 220,
    equipment: ["Tapis", "Ballon"],
    rating: 4.8,
    reviews: 2100,
  },
  {
    id: "5",
    title: "Pilates pour le dos",
    instructor: "Boho Beautiful",
    duration: "25 min",
    level: "Débutant",
    category: "Posture",
    description: "Soulage les douleurs dorsales et renforce les muscles profonds du dos. Idéal après une longue journée assise au bureau.",
    thumbnail: "https://img.youtube.com/vi/Gk-mwnbXz9Q/maxresdefault.jpg",
    source: "youtube",
    videoId: "Gk-mwnbXz9Q",
    calories: 100,
    equipment: ["Tapis"],
    rating: 4.9,
    reviews: 4500,
  },
  {
    id: "6",
    title: "Relaxation & Étirements",
    instructor: "Yoga with Adriene",
    duration: "20 min",
    level: "Tous niveaux",
    category: "Relaxation",
    description: "Une séance douce pour relâcher les tensions musculaires et retrouver un calme profond. À pratiquer le soir pour une meilleure récupération.",
    thumbnail: "https://img.youtube.com/vi/5UEzOHv5l6M/maxresdefault.jpg",
    source: "youtube",
    videoId: "5UEzOHv5l6M",
    calories: 80,
    equipment: ["Tapis"],
    rating: 4.9,
    reviews: 6800,
  },
  {
    id: "7",
    title: "Arms & Shoulders Tone",
    instructor: "Pilates Anytime",
    duration: "20 min",
    level: "Intermédiaire",
    category: "Tonification",
    description: "Tonifie tes bras, tes épaules et ton dos supérieur. Des exercices précis pour un résultat visible rapidement.",
    thumbnail: "https://img.youtube.com/vi/sTANio_2E0Q/maxresdefault.jpg",
    source: "youtube",
    videoId: "sTANio_2E0Q",
    calories: 130,
    equipment: ["Élastique"],
    rating: 4.7,
    reviews: 1560,
  },
  {
    id: "8",
    title: "Perte de poids intense",
    instructor: "MadFit",
    duration: "45 min",
    level: "Avancé",
    category: "Perte de poids",
    description: "Une séance cardio-Pilates combinée pour booster ton métabolisme et brûler un maximum de calories tout en renforçant ta musculature.",
    thumbnail: "https://img.youtube.com/vi/UItWltVZZmE/maxresdefault.jpg",
    source: "youtube",
    videoId: "UItWltVZZmE",
    calories: 380,
    equipment: ["Tapis"],
    rating: 4.8,
    reviews: 5200,
    featured: true,
  },
];

const categories = ["Tout", "Corps entier", "Abdos", "Posture", "Tonification", "Relaxation", "Perte de poids"];
const levels = ["Tout niveau", "Débutant", "Intermédiaire", "Avancé"];
const durations = ["Toute durée", "< 20 min", "20-30 min", "> 30 min"];

const matchesDuration = (video: Video, filter: string) => {
  const mins = parseInt(video.duration);
  if (filter === "< 20 min") return mins < 20;
  if (filter === "20-30 min") return mins >= 20 && mins <= 30;
  if (filter === "> 30 min") return mins > 30;
  return true;
};

const VideoLibrary = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [activeLevel, setActiveLevel] = useState("Tout niveau");
  const [activeDuration, setActiveDuration] = useState("Toute durée");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = videos.filter((v) => {
    const matchCat = activeCategory === "Tout" || v.category === activeCategory;
    const matchLvl = activeLevel === "Tout niveau" || v.level === activeLevel;
    const matchDur = matchesDuration(v, activeDuration);
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.instructor.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLvl && matchDur && matchSearch;
  });

  const featured = videos.filter(v => v.featured);
  const toggleFav = (id: string) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  return (
    <MobileLayout>
      <div className="px-6 pt-14">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-light text-foreground">{t.library.title}</h1>
          <p className="mt-1 font-body text-sm text-muted-foreground">{videos.length} {t.library.available}</p>
        </motion.div>

        {/* Barre de recherche */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cours..."
              className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${
              showFilters ? "border-gold bg-gold/10" : "border-border bg-card"
            }`}
          >
            <Filter size={16} className={showFilters ? "text-gold" : "text-muted-foreground"} strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Filtres avancés */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 rounded-2xl bg-card p-4 space-y-3">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Niveau</p>
                  <div className="flex flex-wrap gap-2">
                    {levels.map(l => (
                      <button key={l} onClick={() => setActiveLevel(l)}
                        className={`rounded-full px-3 py-1.5 font-body text-xs transition-all ${activeLevel === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-2">Durée</p>
                  <div className="flex flex-wrap gap-2">
                    {durations.map(d => (
                      <button key={d} onClick={() => setActiveDuration(d)}
                        className={`rounded-full px-3 py-1.5 font-body text-xs transition-all ${activeDuration === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Catégories */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-xs transition-all ${
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Séances à la une */}
        {activeCategory === "Tout" && !search && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-light text-foreground">À la une</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {featured.map((video) => (
                <motion.button key={video.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="relative flex-shrink-0 w-56 overflow-hidden rounded-2xl bg-card shadow-sm">
                  <div className="relative h-32 overflow-hidden">
                    <img src={video.thumbnail} alt={video.title}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x225/2D2A22/B8973E?text=Pilates"; }}
                    />
                    <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90">
                        <Play size={16} className="text-charcoal ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
                      <Clock size={9} className="text-white" />
                      <span className="font-body text-[9px] text-white">{video.duration}</span>
                    </div>
                    <div className="absolute top-2 right-2 rounded-full bg-gold px-2 py-0.5">
                      <span className="font-body text-[9px] text-white font-medium">⭐ En vedette</span>
                    </div>
                  </div>
                  <div className="p-3 text-left">
                    <p className="font-display text-sm font-light text-foreground truncate">{video.title}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">{video.instructor}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} className="text-gold" fill="#B8973E" />
                      <span className="font-body text-[10px] text-foreground">{video.rating}</span>
                      <span className="font-body text-[10px] text-muted-foreground">· {video.calories} kcal</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Liste complète */}
        <div className="mt-6 space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-light text-foreground">
              {filtered.length} cours
            </h2>
            {(activeCategory !== "Tout" || activeLevel !== "Tout niveau" || activeDuration !== "Toute durée") && (
              <button
                onClick={() => { setActiveCategory("Tout"); setActiveLevel("Tout niveau"); setActiveDuration("Toute durée"); }}
                className="font-body text-[10px] text-gold underline-offset-2"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-body text-sm text-muted-foreground">Aucun cours trouvé</p>
              <button onClick={() => { setSearch(""); setActiveCategory("Tout"); }}
                className="mt-2 font-body text-xs text-gold">Réinitialiser les filtres</button>
            </div>
          ) : (
            filtered.map((video, i) => (
              <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group overflow-hidden rounded-2xl bg-card shadow-sm">
                {/* Thumbnail */}
                <button className="relative w-full h-44 overflow-hidden" onClick={() => setSelectedVideo(video)}>
                  <img src={video.thumbnail} alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x225/2D2A22/B8973E?text=Pilates"; }}
                  />
                  <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-transform group-hover:scale-110">
                      <Play size={20} className="ml-1 text-charcoal" fill="currentColor" />
                    </div>
                  </div>
                  {/* Badges overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                      <Clock size={10} className="text-white" />
                      <span className="font-body text-[10px] text-white">{video.duration}</span>
                    </div>
                    <div className="rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
                      <span className="font-body text-[10px] text-white">{video.calories} kcal</span>
                    </div>
                  </div>
                </button>

                {/* Info + actions */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-light text-foreground truncate">{video.title}</h3>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{video.instructor}</p>
                    </div>
                    <button
                      onClick={() => toggleFav(video.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted transition-all"
                    >
                      <Heart
                        size={15}
                        strokeWidth={1.5}
                        className={favorites.includes(video.id) ? "fill-red-400 text-red-400" : "text-muted-foreground"}
                      />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-border px-2.5 py-0.5 font-body text-[10px] text-muted-foreground">
                      {video.level}
                    </span>
                    <span className="rounded-full border border-border px-2.5 py-0.5 font-body text-[10px] text-muted-foreground">
                      {video.category}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={11} className="text-gold" fill="#B8973E" />
                      <span className="font-body text-xs text-foreground font-medium">{video.rating}</span>
                      <span className="font-body text-[10px] text-muted-foreground">({video.reviews.toLocaleString()})</span>
                    </div>
                  </div>

                  {/* Bouton lancer */}
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-body text-sm font-medium text-primary-foreground transition-all active:scale-[0.98]"
                  >
                    <Play size={14} fill="currentColor" />
                    Lancer la séance
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Lecteur vidéo plein écran */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

export default VideoLibrary;
