export type TrackCategory = 'focus' | 'nature' | 'ambient'

export interface Track {
  id: string
  title: string
  category: TrackCategory
  path: string
  isPro: boolean
}
export const TRACKS: Track[] = [
  // ─── FOCUS — Free (first 3) ────────────────────────────────────────────────
  { id: 'focus-001', title: 'Morning Pages',              category: 'focus', isPro: false, path: '/focus/morning-pages.mp3' },
  { id: 'focus-002', title: 'First Coffee Thoughts',      category: 'focus', isPro: false, path: '/focus/first-coffee-thoughts.mp3' },
  { id: 'focus-003', title: 'Graphite Mornings',          category: 'focus', isPro: false, path: '/focus/graphite-mornings.mp3' },
  { id: 'focus-004', title: '2 AM Debug Loop',            category: 'focus', isPro: false,  path: '/focus/2-am-debug-loop.mp3' },
  { id: 'focus-028', title: 'Terminal Rain',              category: 'focus', isPro: false,  path: '/focus/terminal-rain.mp3' },
  { id: 'focus-036', title: 'Sunset Offbeat',             category: 'focus', isPro: false,  path: '/focus/sunset-offbeat.mp3' },
  { id: 'focus-045', title: 'Midnight Amber Room',        category: 'focus', isPro: false,  path: '/focus/midnight-amber-room.mp3' },

  // ─── FOCUS — Pro ───────────────────────────────────────────────────────────
  { id: 'focus-005', title: 'Brushstrokes and Rain',      category: 'focus', isPro: true,  path: '/focus/brushstrokes-and-rain.mp3' },
  { id: 'focus-006', title: 'Butter and Windowlight',     category: 'focus', isPro: true,  path: '/focus/butter-and-windowlight.mp3' },
  { id: 'focus-007', title: 'Chapter By Lamplight',       category: 'focus', isPro: true,  path: '/focus/chapter-by-lamplight.mp3' },
  { id: 'focus-008', title: 'Coffee Ring Notebook',       category: 'focus', isPro: true,  path: '/focus/coffee-ring-notebook.mp3' },
  { id: 'focus-009', title: 'Continue Screen Dreams',     category: 'focus', isPro: true,  path: '/focus/continue-screen-dreams.mp3' },
  { id: 'focus-010', title: 'Cursor After Midnight',      category: 'focus', isPro: true,  path: '/focus/cursor-after-midnight.mp3' },
  { id: 'focus-011', title: 'Dog Eared Pages',            category: 'focus', isPro: true,  path: '/focus/dog-eared-pages.mp3' },
  { id: 'focus-012', title: 'Dust in the Curtains',       category: 'focus', isPro: true,  path: '/focus/dust-in-the-curtains.mp3' },
  { id: 'focus-013', title: 'Exhale the Morning',         category: 'focus', isPro: true,  path: '/focus/exhale-the-morning.mp3' },
  { id: 'focus-014', title: 'Faded Corners of the Page',  category: 'focus', isPro: true,  path: '/focus/faded-corners-of-the-page.mp3' },
  { id: 'focus-015', title: 'Graphite in the Quiet',      category: 'focus', isPro: true,  path: '/focus/graphite-in-the-quiet.mp3' },
  { id: 'focus-016', title: 'Hour Between Clicks',        category: 'focus', isPro: true,  path: '/focus/hour-between-clicks.mp3' },
  { id: 'focus-017', title: 'Kettle Before Work',         category: 'focus', isPro: true,  path: '/focus/kettle-before-work.mp3' },
  { id: 'focus-018', title: 'Margin Notes at Dusk',       category: 'focus', isPro: true,  path: '/focus/margin-notes-at-dusk.mp3' },
  { id: 'focus-019', title: 'Mat and Morning Light',      category: 'focus', isPro: true,  path: '/focus/mat-and-morning-light.mp3' },
  { id: 'focus-020', title: 'Morning in the Hiss',        category: 'focus', isPro: true,  path: '/focus/morning-in-the-hiss.mp3' },
  { id: 'focus-021', title: 'Pancakes in the Sun',        category: 'focus', isPro: true,  path: '/focus/pancakes-in-the-sun.mp3' },
  { id: 'focus-022', title: 'Penciled Sunbeams',          category: 'focus', isPro: true,  path: '/focus/penciled-sunbeams.mp3' },
  { id: 'focus-023', title: 'Pixel Quest Save Point',     category: 'focus', isPro: true,  path: '/focus/pixel-quest-save-point.mp3' },
  { id: 'focus-024', title: 'Quiet Lungs Quiet Light',    category: 'focus', isPro: true,  path: '/focus/quiet-lungs-quiet-light.mp3' },
  { id: 'focus-025', title: 'Stacks of Quiet Hours',      category: 'focus', isPro: true,  path: '/focus/stacks-of-quiet-hours.mp3' },
  { id: 'focus-026', title: 'Sunday Light Through Lace',  category: 'focus', isPro: true,  path: '/focus/sunday-light-through-lace.mp3' },
  { id: 'focus-027', title: 'Sunrise Stretch Flow',       category: 'focus', isPro: true,  path: '/focus/sunrise-stretch-flow.mp3' },
  { id: 'focus-029', title: 'Watercolors By the Window',  category: 'focus', isPro: true,  path: '/focus/watercolors-by-the-window.mp3' },
  // Chillhop & Cozy Beats
  { id: 'focus-030', title: 'Dusk Between Stoops',        category: 'focus', isPro: true,  path: '/focus/dusk-between-stoops.mp3' },
  { id: 'focus-031', title: 'Dust on the Morning Keys',   category: 'focus', isPro: true,  path: '/focus/dust-on-the-morning-keys.mp3' },
  { id: 'focus-032', title: 'Glow on the Overpass',       category: 'focus', isPro: true,  path: '/focus/glow-on-the-overpass.mp3' },
  { id: 'focus-033', title: 'Porchlight Golden Hour',     category: 'focus', isPro: true,  path: '/focus/porchlight-golden-hour.mp3' },
  { id: 'focus-034', title: 'Sidewalk Slow Jam',          category: 'focus', isPro: true,  path: '/focus/sidewalk-slow-jam.mp3' },
  { id: 'focus-035', title: 'Soft Gold Sky',              category: 'focus', isPro: true,  path: '/focus/soft-gold-sky.mp3' },
  { id: 'focus-037', title: 'Window Seat Daydream',       category: 'focus', isPro: true,  path: '/focus/window-seat-daydream.mp3' },
  // Jazz Lounge & Bookstore Grooves
  { id: 'focus-038', title: 'Ashes in the Coffee Cup',    category: 'focus', isPro: true,  path: '/focus/ashes-in-the-coffee-cup.mp3' },
  { id: 'focus-039', title: 'Breezy Afternoon Terrace',   category: 'focus', isPro: true,  path: '/focus/breezy-afternoon-terrace.mp3' },
  { id: 'focus-040', title: 'Candlelit at 70 BPM',        category: 'focus', isPro: true,  path: '/focus/candlelit-at-70-bpm.mp3' },
  { id: 'focus-041', title: 'Dust and Hardcovers',        category: 'focus', isPro: true,  path: '/focus/dust-and-hardcovers.mp3' },
  { id: 'focus-042', title: 'Harbor Before Words',        category: 'focus', isPro: true,  path: '/focus/harbor-before-words.mp3' },
  { id: 'focus-043', title: 'Last Call in C Minor',       category: 'focus', isPro: true,  path: '/focus/last-call-in-c-minor.mp3' },
  { id: 'focus-044', title: 'Linen and Limoncello',       category: 'focus', isPro: true,  path: '/focus/linen-and-limoncello.mp3' },
  { id: 'focus-046', title: 'Rain on the Boulevard',      category: 'focus', isPro: true,  path: '/focus/rain-on-the-boulevard.mp3' },
  { id: 'focus-047', title: 'Saxophone in the Rain',      category: 'focus', isPro: true,  path: '/focus/saxophone-in-the-rain.mp3' },
  { id: 'focus-048', title: 'Stacks of Quiet Books',      category: 'focus', isPro: true,  path: '/focus/stacks-of-quiet-books.mp3' },
  { id: 'focus-049', title: 'Velvet Cigarette Haze',      category: 'focus', isPro: true,  path: '/focus/velvet-cigarette-haze.mp3' },

  // ─── NATURE — Free (first 3) ───────────────────────────────────────────────
  { id: 'nature-001', title: 'Petals After Rain',         category: 'nature', isPro: false, path: '/nature/petals-after-rain.mp3' },
  { id: 'nature-002', title: 'Fireplace Loop',            category: 'nature', isPro: false, path: '/nature/fireplace-loop.mp3' },
  { id: 'nature-003', title: 'Mist Over Green Fields',    category: 'nature', isPro: false, path: '/nature/mist-over-green-fields.mp3' },
  { id: 'nature-004', title: 'A Taste of Spring',         category: 'nature', isPro: false,  path: '/nature/a-taste-of-spring.mp3' },
  { id: 'nature-005', title: 'After School Rain',         category: 'nature', isPro: false,  path: '/nature/after-school-rain.mp3' },
  { id: 'nature-026', title: 'Tide Stained Polaroids',    category: 'nature', isPro: false,  path: '/nature/tide-stained-polaroids.mp3' },
  { id: 'nature-031', title: 'Misty Steam Quiet Dreams',  category: 'nature', isPro: false,  path: '/nature/misty-steam-quiet-dreams.mp3' },

  // ─── NATURE — Pro ──────────────────────────────────────────────────────────
  { id: 'nature-006', title: 'Amber Sidewalks',           category: 'nature', isPro: true,  path: '/nature/amber-sidewalks.mp3' },
  { id: 'nature-007', title: 'Amber Windowpane',          category: 'nature', isPro: true,  path: '/nature/amber-windowpane.mp3' },
  { id: 'nature-008', title: 'Autumn on the Window Glass',category: 'nature', isPro: true,  path: '/nature/autumn-on-the-window-glass.mp3' },
  { id: 'nature-009', title: 'Bloom Between Showers',     category: 'nature', isPro: true,  path: '/nature/bloom-between-showers.mp3' },
  { id: 'nature-010', title: 'Blossoms on the Pavement',  category: 'nature', isPro: true,  path: '/nature/blossoms-on-the-pavement.mp3' },
  { id: 'nature-011', title: 'Embers After Midnight',     category: 'nature', isPro: true,  path: '/nature/embers-after-midnight.mp3' },
  { id: 'nature-012', title: 'Fallen Leaves Loop',        category: 'nature', isPro: true,  path: '/nature/fallen-leaves-loop.mp3' },
  { id: 'nature-013', title: 'Fieldnotes at Dawn',        category: 'nature', isPro: true,  path: '/nature/fieldnotes-at-dawn.mp3' },
  { id: 'nature-014', title: 'Hammock in the Shade',      category: 'nature', isPro: true,  path: '/nature/hammock-in-the-shade.mp3' },
  { id: 'nature-015', title: 'Lemonade Film Grain',       category: 'nature', isPro: true,  path: '/nature/lemonade-film-grain.mp3' },
  { id: 'nature-016', title: 'Moon Over Red Dunes',       category: 'nature', isPro: true,  path: '/nature/moon-over-red-dunes.mp3' },
  { id: 'nature-017', title: 'Palm Breeze Nap',           category: 'nature', isPro: true,  path: '/nature/palm-breeze-nap.mp3' },
  { id: 'nature-018', title: 'Petals in the Breeze',      category: 'nature', isPro: true,  path: '/nature/petals-in-the-breeze.mp3' },
  { id: 'nature-019', title: 'Picnic Polaroids',          category: 'nature', isPro: true,  path: '/nature/picnic-polaroids.mp3' },
  { id: 'nature-020', title: 'Sidewalk Puddles',          category: 'nature', isPro: true,  path: '/nature/sidewalk-puddles.mp3' },
  { id: 'nature-021', title: 'Snow on the Needle',        category: 'nature', isPro: true,  path: '/nature/snow-on-the-needle.mp3' },
  { id: 'nature-022', title: 'Spring Garden Loops',       category: 'nature', isPro: true,  path: '/nature/spring-garden-loops.mp3' },
  { id: 'nature-023', title: 'Starlight in the Sand',     category: 'nature', isPro: true,  path: '/nature/starlight-in-the-sand.mp3' },
  { id: 'nature-024', title: 'Storm Over Side Streets',   category: 'nature', isPro: true,  path: '/nature/storm-over-side-streets.mp3' },
  { id: 'nature-025', title: 'Thunder in the Dust',       category: 'nature', isPro: true,  path: '/nature/thunder-in-the-dust.mp3' },
  { id: 'nature-027', title: 'Winter Turntable',          category: 'nature', isPro: true,  path: '/nature/winter-turntable.mp3' },
  // Asian & Zen Lo-Fi
  { id: 'nature-028', title: 'Bamboo Shadow Waltz',       category: 'nature', isPro: true,  path: '/nature/bamboo-shadow-waltz.mp3' },
  { id: 'nature-029', title: 'Bells Before Sunrise',      category: 'nature', isPro: true,  path: '/nature/bells-before-sunrise.mp3' },
  { id: 'nature-030', title: 'Lanterns in Slow Motion',   category: 'nature', isPro: true,  path: '/nature/lanterns-in-slow-motion.mp3' },
  { id: 'nature-032', title: 'Moon Through Bamboo',       category: 'nature', isPro: true,  path: '/nature/moon-through-bamboo.mp3' },
  { id: 'nature-033', title: 'Paper Lantern Rain',        category: 'nature', isPro: true,  path: '/nature/paper-lantern-rain.mp3' },
  { id: 'nature-034', title: 'Teacup Morning Fog',        category: 'nature', isPro: true,  path: '/nature/teacup-morning-fog.mp3' },
  { id: 'nature-035', title: 'Temple at Dawn',            category: 'nature', isPro: true,  path: '/nature/temple-at-dawn.mp3' },

  // ─── AMBIENT — Free (first 3) ──────────────────────────────────────────────
  { id: 'ambient-001', title: 'Drifting Through Fog',     category: 'ambient', isPro: false, path: '/ambient/drifting-through-fog.mp3' },
  { id: 'ambient-002', title: 'Moonlit Moss',             category: 'ambient', isPro: false, path: '/ambient/moonlit-moss.mp3' },
  { id: 'ambient-003', title: 'Misty Mountain Sunrise',   category: 'ambient', isPro: false, path: '/ambient/misty-mountain-sunrise.mp3' },
  { id: 'ambient-021', title: 'Warm Constellations',      category: 'ambient', isPro: false,  path: '/ambient/warm-constellations.mp3' },
  { id: 'ambient-020', title: 'Underwater Dreamscape',    category: 'ambient', isPro: false,  path: '/ambient/underwater-dreamscape.mp3' },
  { id: 'ambient-010', title: 'Ghosts on the Hillside',   category: 'ambient', isPro: false,  path: '/ambient/ghosts-on-the-hillside.mp3' },
  { id: 'ambient-022', title: 'Cafe Da Tarde',            category: 'ambient', isPro: false,  path: '/ambient/cafe-da-tarde.mp3' },

  // ─── AMBIENT — Pro ─────────────────────────────────────────────────────────
  { id: 'ambient-004', title: 'Almost Floating',          category: 'ambient', isPro: true,  path: '/ambient/almost-floating.mp3' },
  { id: 'ambient-005', title: 'Aurora on Mute',           category: 'ambient', isPro: true,  path: '/ambient/aurora-on-mute.mp3' },
  { id: 'ambient-006', title: 'Blue Below the Surface',   category: 'ambient', isPro: true,  path: '/ambient/blue-below-the-surface.mp3' },
  { id: 'ambient-007', title: 'Cathedral Hiss',           category: 'ambient', isPro: true,  path: '/ambient/cathedral-hiss.mp3' },
  { id: 'ambient-008', title: 'Deep Space Loop',          category: 'ambient', isPro: true,  path: '/ambient/deep-space-loop.mp3' },
  { id: 'ambient-009', title: 'First Light on the Ridge', category: 'ambient', isPro: true,  path: '/ambient/first-light-on-the-ridge.mp3' },
  { id: 'ambient-011', title: 'Glasshouse Ghosts',        category: 'ambient', isPro: true,  path: '/ambient/glasshouse-ghosts.mp3' },
  { id: 'ambient-012', title: 'Green After Midnight',     category: 'ambient', isPro: true,  path: '/ambient/green-after-midnight.mp3' },
  { id: 'ambient-013', title: 'Orbiting in Silence',      category: 'ambient', isPro: true,  path: '/ambient/orbiting-in-silence.mp3' },
  { id: 'ambient-014', title: 'Polar Afterglow',          category: 'ambient', isPro: true,  path: '/ambient/polar-afterglow.mp3' },
  { id: 'ambient-015', title: 'Satellite Lullaby',        category: 'ambient', isPro: true,  path: '/ambient/satellite-lullaby.mp3' },
  { id: 'ambient-016', title: 'Sea Glass Evening',        category: 'ambient', isPro: true,  path: '/ambient/sea-glass-evening.mp3' },
  { id: 'ambient-017', title: 'Soft Weightless Hours',    category: 'ambient', isPro: true,  path: '/ambient/soft-weightless-hours.mp3' },
  { id: 'ambient-018', title: 'Stained Glass Static',     category: 'ambient', isPro: true,  path: '/ambient/stained-glass-static.mp3' },
  { id: 'ambient-019', title: 'Tide Pools at Twilight',   category: 'ambient', isPro: true,  path: '/ambient/tide-pools-at-twilight.mp3' },
  // Hybrid, World & Cinematic
  { id: 'ambient-023', title: 'Cassette Pastel Nights',   category: 'ambient', isPro: true,  path: '/ambient/cassette-pastel-nights.mp3' },
  { id: 'ambient-024', title: 'Dusk on Red Earth',        category: 'ambient', isPro: true,  path: '/ambient/dusk-on-red-earth.mp3' },
  { id: 'ambient-025', title: 'End Scene Glow',           category: 'ambient', isPro: true,  path: '/ambient/end-scene-glow.mp3' },
  { id: 'ambient-026', title: 'Midnight Steam and Mango Skin', category: 'ambient', isPro: true, path: '/ambient/midnight-steam-and-mango-skin.mp3' },
  { id: 'ambient-027', title: 'Quiet Credits',            category: 'ambient', isPro: true,  path: '/ambient/quiet-credits.mp3' },
  { id: 'ambient-028', title: 'Savanna Slow Glow',        category: 'ambient', isPro: true,  path: '/ambient/savanna-slow-glow.mp3' },
  { id: 'ambient-029', title: 'VHS Heartbeat',            category: 'ambient', isPro: true,  path: '/ambient/vhs-heartbeat.mp3' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getTracksByCategory(category: TrackCategory): Track[] {
  return TRACKS.filter(t => t.category === category)
}

export function getFreeTracksByCategory(category: TrackCategory): Track[] {
  return TRACKS.filter(t => t.category === category && !t.isPro)
}

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find(t => t.id === id)
}

export function getNextTrack(currentId: string, category?: TrackCategory): Track | undefined {
  const pool = category ? getTracksByCategory(category) : TRACKS
  const idx = pool.findIndex(t => t.id === currentId)
  if (idx === -1) return pool[0]
  return pool[(idx + 1) % pool.length]
}

export function getPrevTrack(currentId: string, category?: TrackCategory): Track | undefined {
  const pool = category ? getTracksByCategory(category) : TRACKS
  const idx = pool.findIndex(t => t.id === currentId)
  if (idx === -1) return pool[0]
  return pool[(idx - 1 + pool.length) % pool.length]
}

export function getShuffleTrack(currentId: string, category?: TrackCategory): Track {
  const pool = (category ? getTracksByCategory(category) : TRACKS).filter(t => t.id !== currentId)
  return pool[Math.floor(Math.random() * pool.length)]
}