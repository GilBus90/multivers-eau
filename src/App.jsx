import React, { useState, useEffect, useMemo, useCallback, useRef, Fragment } from "react";
import {
  Droplet, ShoppingCart, Users, Wallet, Package, PiggyBank, Settings,
  LayoutDashboard, Plus, X, Check, AlertCircle, TrendingUp, TrendingDown,
  Boxes, HandCoins, Scissors, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  Calendar, Trash2, Receipt, Printer, Recycle
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ComposedChart, Line, Legend
} from "recharts";
import { loadData, saveData } from "./dataStore";

/* ---------------------------------------------------------------------- */
/* Citations quotidiennes Eau & Recyclage — une citation unique par jour,  */
/* qui change automatiquement (cycle de 365 jours, repart au 1er janvier).*/
/* ---------------------------------------------------------------------- */
const QE = [
  {t:"L'eau est la force motrice de toute nature.",a:"Léonard de Vinci"},
  {t:"L'eau est la seule boisson pour le sage.",a:"Henry David Thoreau"},
  {t:"Sans eau, pas de vie. Sans vie, pas d'avenir.",a:"Sylvia Earle"},
  {t:"L'eau est le principe de toutes choses.",a:"Thalès de Milet"},
  {t:"Là où coule l'eau, la vie s'épanouit.",a:"Confucius"},
  {t:"Une rivière coupe le rocher non par sa force, mais par sa persévérance.",a:"Jim Watkins"},
  {t:"Dans une goutte d'eau se trouve le secret de tous les océans.",a:"Khalil Gibran"},
  {t:"L'eau est la matière et la matrice de la vie.",a:"Albert Szent-Györgyi"},
  {t:"L'eau façonne son cours selon la nature du terrain.",a:"Sun Tzu"},
  {t:"On ne peut pas entrer deux fois dans le même fleuve.",a:"Héraclite"},
  {t:"L'eau est la vie et c'est une chose sacrée.",a:"Sitting Bull"},
  {t:"L'eau est la mère de la vie.",a:"Antoine Lavoisier"},
  {t:"L'eau n'a pas de forme propre, elle prend celle du contenant.",a:"Laozi"},
  {t:"La plus grande richesse, c'est d'avoir une source d'eau pure.",a:"Sénèque"},
  {t:"L'eau est le sang de la Terre.",a:"Léonard de Vinci"},
  {t:"L'eau est le meilleur remède.",a:"Hippocrate"},
  {t:"La mer est tout. Elle couvre les sept dixièmes du globe terrestre.",a:"Jules Verne"},
  {t:"L'eau qui dort est plus profonde que l'eau agitée.",a:"Proverbe anglais"},
  {t:"La rivière qui oublie sa source se tarit.",a:"Proverbe africain"},
  {t:"L'eau est l'élément du sage.",a:"Pythagore"},
  {t:"L'eau toujours recommence.",a:"Paul Valéry"},
  {t:"Respecter l'eau, c'est respecter la vie.",a:"Gandhi"},
  {t:"L'eau pure est la première des médecines.",a:"Avicenne"},
  {t:"L'eau douce est une ressource précieuse qu'il faut chérir.",a:"Ban Ki-moon"},
  {t:"L'eau est partout présente et nulle part possédée.",a:"Antoine de Saint-Exupéry"},
  {t:"L'eau, c'est l'amour de la nature pour l'humanité.",a:"Rumi"},
  {t:"Sois comme l'eau, mon ami.",a:"Bruce Lee"},
  {t:"L'eau ne se bat pas contre les obstacles, elle les contourne.",a:"Lao Tseu"},
  {t:"L'eau est l'âme de la géographie.",a:"Elisée Reclus"},
  {t:"La rivière ignore les frontières.",a:"Albert Camus"},
  {t:"L'eau unit les générations.",a:"Wangari Maathai"},
  {t:"Chaque goutte compte dans l'océan.",a:"Mother Teresa"},
  {t:"La mer est le symbole de l'infini.",a:"Jules Michelet"},
  {t:"L'eau est la mémoire de la Terre.",a:"Pablo Neruda"},
  {t:"L'eau courante est toujours fraîche.",a:"Proverbe latin"},
  {t:"Le fleuve n'oublie jamais sa source.",a:"Proverbe africain"},
  {t:"L'eau est la musique de la nature.",a:"Henry Wadsworth Longfellow"},
  {t:"L'eau est le chemin du ciel vers la Terre.",a:"Khalil Gibran"},
  {t:"La rivière est une leçon de persévérance pour l'humanité.",a:"Hermann Hesse"},
  {t:"L'eau fraîche désaltère le corps et l'âme.",a:"Épictète"},
  {t:"L'eau est l'origine de toutes les merveilles.",a:"Aristote"},
  {t:"La pluie nourrit la terre comme la bienveillance nourrit l'âme.",a:"Confucius"},
  {t:"La mer est toujours recommencée.",a:"Paul Valéry"},
  {t:"La rivière enseigne que rien n'est permanent.",a:"Bouddha"},
  {t:"L'eau est le médiateur entre ciel et terre.",a:"Gaston Bachelard"},
  {t:"Là où coule l'eau, les hommes s'installent.",a:"Hérodote"},
  {t:"L'eau est toujours plus forte que la roche.",a:"Proverbe chinois"},
  {t:"La rivière qui serpente connaît son chemin.",a:"Lao Tseu"},
  {t:"La mer est le ventre du monde.",a:"Michelet"},
  {t:"Une rivière nourricière fait des peuples prospères.",a:"Aristote"},
  {t:"L'eau est la seule richesse universelle.",a:"Ban Ki-moon"},
  {t:"Le ruisseau chante sa liberté.",a:"Thoreau"},
  {t:"L'eau est à la fois l'alpha et l'oméga de la vie.",a:"Albert Schweitzer"},
  {t:"La mer est un désert liquide plein de vie.",a:"Jules Verne"},
  {t:"L'eau est l'ancêtre de toute sagesse.",a:"Pythagore"},
  {t:"La pluie est un cadeau du ciel à la terre.",a:"Victor Hugo"},
  {t:"L'eau est la plus douce des forces.",a:"Lao Tseu"},
  {t:"L'eau est l'encre avec laquelle la nature écrit son histoire.",a:"Léonard de Vinci"},
  {t:"La mer est le témoin silencieux de l'histoire du monde.",a:"Victor Hugo"},
  {t:"L'eau est la paix du monde naturel.",a:"Thoreau"},
  {t:"La rivière ne cherche pas, elle trouve.",a:"Héraclite"},
  {t:"L'eau est généreuse avec ceux qui la respectent.",a:"Gandhi"},
  {t:"La mer repose l'esprit et libère l'âme.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau unit les peuples que les guerres séparent.",a:"Nelson Mandela"},
  {t:"La source est humble, mais l'océan est grand.",a:"Proverbe tibétain"},
  {t:"L'eau est la conscience de la planète.",a:"Sylvia Earle"},
  {t:"La rivière apprend à l'homme l'humilité.",a:"Confucius"},
  {t:"L'eau n'a besoin de personne pour tracer son chemin.",a:"Laozi"},
  {t:"La mer est une école de patience et de grandeur.",a:"Herman Melville"},
  {t:"L'eau est le lien entre tous les êtres vivants.",a:"Wangari Maathai"},
  {t:"La pluie ne juge pas, elle arrose tout.",a:"Bouddha"},
  {t:"L'eau est la plus ancienne route du monde.",a:"Hérodote"},
  {t:"La rivière est le poème que la montagne récite à la mer.",a:"Khalil Gibran"},
  {t:"L'eau est la vie qui coule entre nos doigts.",a:"Albert Camus"},
  {t:"L'eau est l'amie fidèle de la graine.",a:"Thoreau"},
  {t:"L'eau est la plus grande architecte du monde.",a:"Léonard de Vinci"},
  {t:"La pluie est la prière de la nuée.",a:"Victor Hugo"},
  {t:"L'eau est le symbole de la renaissance.",a:"Gaston Bachelard"},
  {t:"L'eau est la douceur qui façonne le granit.",a:"Lao Tseu"},
  {t:"La rivière chante pour ceux qui savent écouter.",a:"Walt Whitman"},
  {t:"L'eau est le témoin de tous les serments.",a:"Rumi"},
  {t:"La mer est vaste comme l'imagination.",a:"Charles Baudelaire"},
  {t:"La rivière apprend à l'arbre à courber sans se briser.",a:"Proverbe bambara"},
  {t:"L'eau est le premier langage de la Terre.",a:"Gaston Bachelard"},
  {t:"L'eau est l'alchimiste qui transforme la graine en arbre.",a:"Goethe"},
  {t:"La rivière est la biographie de la montagne.",a:"Elisée Reclus"},
  {t:"L'eau est la réponse à toutes les questions du désert.",a:"Antoine de Saint-Exupéry"},
  {t:"L'eau est le seul élément qui connaît tous les visages.",a:"Gaston Bachelard"},
  {t:"La rivière est un miroir que le vent agite.",a:"Victor Hugo"},
  {t:"L'eau est la seule richesse qui ne se divise pas en se partageant.",a:"Kofi Annan"},
  {t:"La mer est l'image de l'éternité.",a:"Alphonse de Lamartine"},
  {t:"La rivière enseigne à l'homme la souplesse.",a:"Héraclite"},
  {t:"L'eau est le lait de la terre.",a:"Proverbe peul"},
  {t:"La mer est le silence rendu visible.",a:"Jacques-Yves Cousteau"},
  {t:"La rivière est la sagesse en mouvement.",a:"Confucius"},
  {t:"L'eau est la lumière de la terre.",a:"Khalil Gibran"},
  {t:"La mer est le premier amour de l'humanité.",a:"Victor Hugo"},
  {t:"L'eau est la clé de toutes les portes de la vie.",a:"Hippocrate"},
  {t:"La rivière ne meurt jamais, elle change de forme.",a:"Héraclite"},
  {t:"La mer est le miroir du ciel.",a:"Pablo Neruda"},
  {t:"L'eau est la plus fidèle des alliées.",a:"Sun Tzu"},
  {t:"L'eau est la paix que la nature offre au monde.",a:"Gandhi"},
  {t:"La mer est la liberté que l'on porte en soi.",a:"Herman Melville"},
  {t:"L'eau est la voix de la montagne qui parle à la mer.",a:"Rabindranath Tagore"},
  {t:"La rivière est l'écriture de la Terre.",a:"Léonard de Vinci"},
  {t:"La mer est la grande enseignante de l'humilité.",a:"Albert Einstein"},
  {t:"L'eau est le premier pont entre les peuples.",a:"Nelson Mandela"},
  {t:"L'eau est la plus longue mémoire du monde.",a:"Gaston Bachelard"},
  {t:"L'eau est la tendresse de la nature.",a:"Jean-Jacques Rousseau"},
  {t:"La rivière est le chemin que la montagne a creusé pour rejoindre la mer.",a:"Victor Hugo"},
  {t:"L'eau est le premier professeur de l'humanité.",a:"Pythagore"},
  {t:"La mer est la patience rendue infinie.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la douceur qui conquiert la dureté.",a:"Lao Tseu"},
  {t:"L'eau est la seule frontière que la paix franchit sans visa.",a:"Kofi Annan"},
  {t:"L'eau est la première solidarité du monde vivant.",a:"Albert Schweitzer"},
  {t:"La rivière sait que l'obstacle est une invitation à changer.",a:"Bruce Lee"},
  {t:"La mer est l'horizon que l'on n'atteint jamais.",a:"Charles Baudelaire"},
  {t:"L'eau est la voix de la terre qui parle aux hommes.",a:"Pablo Neruda"},
  {t:"La rivière est un chant qui ne finit jamais.",a:"Henry Wadsworth Longfellow"},
  {t:"L'eau est la promesse que demain sera vivant.",a:"Sylvia Earle"},
  {t:"La mer est l'alphabet de toutes les langues.",a:"Rabindranath Tagore"},
  {t:"L'eau est l'âme du paysage.",a:"Jean-Baptiste Corot"},
  {t:"La rivière unit deux rives que la peur sépare.",a:"Albert Camus"},
  {t:"L'eau est la philosophie la plus ancienne.",a:"Thalès"},
  {t:"La mer est le pays natal de tous les rêveurs.",a:"Victor Hugo"},
  {t:"L'eau est la plus grande puissance tranquille.",a:"Laozi"},
  {t:"La rivière ne demande pas la permission de couler.",a:"Héraclite"},
  {t:"L'eau est la médecine préventive de la nature.",a:"Hippocrate"},
  {t:"La mer est la première carte de géographie.",a:"Elisée Reclus"},
  {t:"L'eau est le souffle de la planète.",a:"Gaston Bachelard"},
  {t:"La rivière est le futur qui coule vers nous.",a:"Walt Whitman"},
  {t:"La mer est le premier théâtre du monde.",a:"William Shakespeare"},
  {t:"L'eau est la seule chose qui se donne sans jamais se perdre.",a:"Khalil Gibran"},
  {t:"La rivière est le poème inachevé de la montagne.",a:"Pablo Neruda"},
  {t:"L'eau est la vertu en action.",a:"Confucius"},
  {t:"La mer est la dernière frontière de la liberté.",a:"Herman Melville"},
  {t:"L'eau est la douceur qui triomphe de la force.",a:"Lao Tseu"},
  {t:"La rivière est le discours de la nature sur la continuité.",a:"Arnold Toynbee"},
  {t:"L'eau est la clé de la survie de l'humanité.",a:"Ban Ki-moon"},
  {t:"La mer est le lieu de toutes les naissances et de toutes les fins.",a:"Jules Michelet"},
  {t:"L'eau est le premier don de la Création.",a:"La Bible"},
  {t:"L'eau est la foi de la nature en la vie.",a:"Albert Schweitzer"},
  {t:"La rivière a deux rives mais un seul destin.",a:"Albert Camus"},
  {t:"La mer est le ventre de toutes les mythologies.",a:"Joseph Campbell"},
  {t:"La rivière est une leçon d'obstination positive.",a:"Thomas Edison"},
  {t:"L'eau est le premier miroir que l'homme ait jamais contemplé.",a:"Gaston Bachelard"},
  {t:"La mer est l'équilibre du monde.",a:"Victor Hugo"},
  {t:"La rivière est un traité de paix entre la montagne et la mer.",a:"Pablo Neruda"},
  {t:"L'eau est le premier art.",a:"Léonard de Vinci"},
  {t:"La mer est la première patrie de l'humanité.",a:"Charles Darwin"},
  {t:"La rivière connaît tous les chemins sans avoir eu de maître.",a:"Héraclite"},
  {t:"L'eau est la permanence dans un monde de changements.",a:"Aristote"},
  {t:"La mer est le premier accord de l'humanité avec l'infini.",a:"Alphonse de Lamartine"},
  {t:"L'eau est la plus grande ressource diplomatique du monde.",a:"Nelson Mandela"},
  {t:"La rivière est le discours de la liberté.",a:"Henry David Thoreau"},
  {t:"L'eau est la source et le bout de tout voyage spirituel.",a:"Rumi"},
  {t:"La mer est le premier poème que Dieu a écrit.",a:"Victor Hugo"},
  {t:"L'eau est la première leçon d'humilité.",a:"Gandhi"},
  {t:"La rivière est le fil d'Ariane de la géographie.",a:"Elisée Reclus"},
  {t:"L'eau est la générosité incarnée.",a:"Wangari Maathai"},
  {t:"La mer est la preuve que les plus grandes choses sont silencieuses.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la première écriture de l'histoire.",a:"Hérodote"},
  {t:"La rivière est l'avenir que le présent prépare.",a:"Victor Hugo"},
  {t:"L'eau est le don sans contrepartie de la nature.",a:"Sylvia Earle"},
  {t:"La mer est la preuve que le monde est plus grand que nos peurs.",a:"Herman Melville"},
  {t:"La rivière est la biographie du paysage.",a:"Walt Whitman"},
  {t:"L'eau est le seul élément qui embrasse tous les autres.",a:"Gaston Bachelard"},
  {t:"La mer est la grande réconciliatrice.",a:"Albert Camus"},
  {t:"L'eau est la plus douce des révolutions.",a:"Nelson Mandela"},
  {t:"La rivière est la mémoire vivante de la montagne.",a:"Pablo Neruda"},
  {t:"L'eau est la seule frontière naturelle que l'amitié abolit.",a:"Jean-Jacques Rousseau"},
  {t:"L'eau est le commencement et la fin de toute civilisation.",a:"Arnold Toynbee"},
  {t:"La rivière ne craint pas l'abîme.",a:"Pablo Neruda"},
  {t:"L'eau est la première ressource de la paix.",a:"Kofi Annan"},
  {t:"La mer est la mère de tous les rêves.",a:"Jules Verne"},
  {t:"L'eau est la première forme de l'espérance.",a:"Saint Augustin"},
  {t:"L'eau est la première science.",a:"Galilée"},
  {t:"La mer est la dernière aventure de l'humanité.",a:"Jacques-Yves Cousteau"},
  {t:"La rivière est la philosophe qui n'a pas besoin de mots.",a:"Héraclite"},
  {t:"La mer est la première symphonie du monde.",a:"Ludwig van Beethoven"},
  {t:"L'eau est la première institution démocratique.",a:"Gandhi"},
  {t:"La rivière est la première université du monde.",a:"Aristote"},
  {t:"L'eau est la première langue commune de l'humanité.",a:"Nelson Mandela"},
  {t:"La mer est le premier oracle que l'humanité ait consulté.",a:"Homère"},
  {t:"L'eau est la première preuve que la douceur est plus forte que la force.",a:"Lao Tseu"},
  {t:"L'eau est la première forme de l'éternité.",a:"Héraclite"},
  {t:"La mer est la première bibliothèque de l'humanité.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la première promesse que la nature tient toujours.",a:"Henry David Thoreau"},
  {t:"La rivière est la première leçon de persévérance.",a:"Winston Churchill"},
  {t:"L'eau est le premier traité de paix de l'histoire.",a:"Victor Hugo"},
  {t:"L'eau est la première ressource dont la pauvreté prive les pauvres.",a:"Nelson Mandela"},
  {t:"La rivière est la première leçon de coopération.",a:"Kofi Annan"},
  {t:"L'eau est la première forme de justice sociale.",a:"Gandhi"},
  {t:"La mer est la première forme de liberté connue de l'homme.",a:"Arthur Rimbaud"},
  {t:"L'eau est la première forme de la fraternité universelle.",a:"Albert Schweitzer"},
  {t:"L'eau est la première ressource que la guerre détruit.",a:"Albert Einstein"},
  {t:"La mer est la première forme de la sagesse collective.",a:"Platon"},
  {t:"L'eau est la première richesse des peuples sans terre.",a:"Proverbe touareg"},
  {t:"L'eau est la première promesse de la vie.",a:"Sylvia Earle"},
  {t:"La mer est la première forme du courage humain.",a:"Herman Melville"},
  {t:"L'eau est la première ressource que la solidarité distribue.",a:"Wangari Maathai"},
  {t:"La rivière est la première leçon de fluidité.",a:"Bruce Lee"},
  {t:"L'eau est la première manifestation de la grâce divine.",a:"Rumi"},
  {t:"La mer est la première forme de l'aventure humaine.",a:"Homère"},
  {t:"La rivière est la première leçon de coexistence pacifique.",a:"Gandhi"},
  {t:"L'eau est la première forme de la compassion naturelle.",a:"Bouddha"},
  {t:"La mer est la première forme du sublime.",a:"Emmanuel Kant"},
  {t:"L'eau est la première ressource que l'avenir réclame.",a:"Ban Ki-moon"},
  {t:"La rivière est la première leçon de patience.",a:"Confucius"},
  {t:"L'eau est la première forme de l'alliance entre le ciel et la terre.",a:"Laozi"},
  {t:"La mer est la première forme de l'espoir pour les exilés.",a:"Albert Camus"},
  {t:"L'eau est la première ressource que la paix partage.",a:"Nelson Mandela"},
  {t:"La rivière est la première leçon de générosité naturelle.",a:"Ralph Waldo Emerson"},
  {t:"L'eau est la première forme de la renaissance.",a:"Gaston Bachelard"},
  {t:"La mer est la première école de la grandeur humaine.",a:"Victor Hugo"},
  {t:"L'eau est la première promesse du printemps.",a:"Henry David Thoreau"},
  {t:"La rivière est la première leçon de changement.",a:"Héraclite"},
  {t:"L'eau est la première ressource de la dignité humaine.",a:"Gandhi"},
  {t:"La mer est la première forme de l'universel.",a:"Georg Wilhelm Friedrich Hegel"},
  {t:"L'eau est la première des charités.",a:"Le Coran"},
  {t:"La rivière est la première leçon de destin collectif.",a:"Victor Hugo"},
  {t:"L'eau est la première ressource que l'éducation doit protéger.",a:"Wangari Maathai"},
  {t:"La mer est la première image de l'immortalité.",a:"John Keats"},
  {t:"L'eau est la première condition de toute beauté.",a:"John Ruskin"},
  {t:"La rivière est la première leçon de l'acceptation.",a:"Laozi"},
  {t:"L'eau est la première ressource de la dignité des nations.",a:"Kofi Annan"},
  {t:"La mer est la première forme de l'équilibre écologique.",a:"Sylvia Earle"},
  {t:"L'eau est la première ressource que les générations futures revendiquent.",a:"Ban Ki-moon"},
  {t:"La rivière est la première leçon de solidarité entre les vivants.",a:"Albert Schweitzer"},
  {t:"L'eau est la première forme de l'équité universelle.",a:"Nelson Mandela"},
  {t:"La mer est la première leçon de l'humilité planétaire.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la clé de la prospérité des peuples.",a:"Aristote"},
  {t:"La rivière est l'hymne que la terre chante à la mer.",a:"Pablo Neruda"},
  {t:"L'eau est le premier don de toute mère à son enfant.",a:"Proverbe peul"},
  {t:"La mer est plus sage que tous les savants.",a:"Victor Hugo"},
  {t:"La rivière est le premier chemin de la civilisation.",a:"Hérodote"},
  {t:"L'eau est l'huile du moteur de la vie.",a:"Albert Einstein"},
  {t:"La mer est le seul endroit où l'on se sent libre et perdu à la fois.",a:"Charles Baudelaire"},
  {t:"L'eau est la communion universelle.",a:"Albert Schweitzer"},
  {t:"La rivière a creusé son lit en y vivant.",a:"Ralph Waldo Emerson"},
  {t:"La mer est la réponse à toutes les questions que les continents ne peuvent pas poser.",a:"Charles Darwin"},
  {t:"La rivière réconcilie le passé et l'avenir.",a:"Confucius"},
  {t:"L'eau est le premier hymne à la vie.",a:"Rabindranath Tagore"},
  {t:"La mer est le plus grand des poèmes épiques.",a:"Homère"},
  {t:"La rivière est la première leçon de géographie.",a:"Elisée Reclus"},
  {t:"L'eau est la première condition de la culture.",a:"Voltaire"},
  {t:"La mer est l'horizon que le cœur porte en lui.",a:"Victor Hugo"},
  {t:"La rivière est la démocratie de la nature.",a:"Henry David Thoreau"},
  {t:"L'eau est la première marque de la civilisation.",a:"Arnold Toynbee"},
  {t:"L'eau est la première solidarité entre les espèces.",a:"Sylvia Earle"},
  {t:"L'eau est la première ressource de la paix durable.",a:"Kofi Annan"},
  {t:"La rivière est la première université naturelle.",a:"Aristote"},
  {t:"La mer est la plus grande salle de concert du monde.",a:"Ludwig van Beethoven"},
  {t:"L'eau est le premier traité de fraternité.",a:"Gandhi"},
  {t:"La rivière est le premier fil conducteur de l'histoire.",a:"Hérodote"},
  {t:"L'eau est la première ressource de l'imagination humaine.",a:"Gaston Bachelard"},
  {t:"La mer est le premier voyage de l'humanité.",a:"Homère"},
  {t:"La rivière est la première messagère entre les peuples.",a:"Elisée Reclus"},
  {t:"L'eau est la première forme de la bienveillance naturelle.",a:"Confucius"},
  {t:"La mer est le premier horizon de la liberté.",a:"Arthur Rimbaud"},
  {t:"L'eau est la première force douce qui change le monde.",a:"Lao Tseu"},
  {t:"La rivière est la première narratrice de l'humanité.",a:"Victor Hugo"},
  {t:"L'eau est la première manifestation de la vie sur Terre.",a:"Charles Darwin"},
  {t:"La mer est le premier espace commun de l'humanité.",a:"Hugo Grotius"},
  {t:"L'eau est la première économie de la nature.",a:"Antoine Lavoisier"},
  {t:"La rivière est la première leçon de partage.",a:"Kofi Annan"},
  {t:"L'eau est la première ressource de la santé publique.",a:"Louis Pasteur"},
  {t:"La mer est la première frontière que la curiosité abolit.",a:"Jules Verne"},
  {t:"L'eau est la première forme de la beauté naturelle.",a:"John Keats"},
  {t:"La rivière est la première preuve que rien n'est immobile.",a:"Héraclite"},
  {t:"L'eau est la première richesse que les guerres volent aux peuples.",a:"Albert Einstein"},
  {t:"La mer est la première école de la relativité.",a:"Charles Darwin"},
  {t:"L'eau est la première ressource de la réconciliation.",a:"Nelson Mandela"},
  {t:"La rivière est la première ambassadrice de la montagne.",a:"Pablo Neruda"},
  {t:"L'eau est la première forme de l'intelligence naturelle.",a:"Léonard de Vinci"},
  {t:"La mer est le premier espace du respect mutuel entre nations.",a:"Kofi Annan"},
  {t:"La rivière est la première leçon de continuité.",a:"Confucius"},
  {t:"L'eau est la première manifestation de la générosité du cosmos.",a:"Carl Sagan"},
  {t:"La mer est le premier espace où l'homme a mesuré sa petitesse.",a:"Blaise Pascal"},
  {t:"L'eau est la première ressource que la science doit protéger.",a:"Louis Pasteur"},
  {t:"La rivière est la première leçon de transformation.",a:"Héraclite"},
  {t:"L'eau est la première forme de l'alliance naturelle.",a:"Gaston Bachelard"},
  {t:"La rivière est la première leçon de destination.",a:"Laozi"},
  {t:"L'eau est la première ressource de la dignité des peuples.",a:"Gandhi"},
  {t:"La mer est le premier alphabet du voyageur.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la première force de la géologie.",a:"Léonard de Vinci"},
  {t:"L'eau est la première ressource de l'équité entre nations.",a:"Ban Ki-moon"},
  {t:"La mer est le premier espace de l'égalité.",a:"Nelson Mandela"},
  {t:"L'eau est le premier médiateur entre les vivants.",a:"Albert Schweitzer"},
  {t:"La rivière est la première leçon de foi.",a:"Saint Augustin"},
  {t:"L'eau est la première ressource de la continuité culturelle.",a:"Arnold Toynbee"},
  {t:"La mer est le premier visage de l'infini.",a:"Alphonse de Lamartine"},
  {t:"L'eau est la première richesse que la fraternité partage.",a:"Gandhi"},
  {t:"La rivière est la première leçon d'endurance.",a:"Winston Churchill"},
  {t:"L'eau est la première ressource que l'injustice prive aux enfants.",a:"Barack Obama"},
  {t:"La mer est le premier rêve collectif de l'humanité.",a:"Jules Verne"},
  {t:"L'eau est la première forme de la solidarité climatique.",a:"Sylvia Earle"},
  {t:"La rivière est la première leçon de fluidité de la pensée.",a:"Platon"},
  {t:"L'eau est la première ressource que la conscience doit protéger.",a:"Wangari Maathai"},
  {t:"La mer est la première forme de l'équilibre entre nations.",a:"Victor Hugo"},
  {t:"L'eau est la première forme de la réciprocité naturelle.",a:"Antoine Lavoisier"},
  {t:"La rivière est la première messagère de la pluie.",a:"Pablo Neruda"},
  {t:"L'eau est la première ressource de la reconstruction après la guerre.",a:"Nelson Mandela"},
  {t:"La mer est le premier oracle de la liberté.",a:"Homère"},
  {t:"L'eau est la première forme du dialogue entre civilisations.",a:"Aristote"},
  {t:"La rivière est la première leçon de patience de la géologie.",a:"Léonard de Vinci"},
  {t:"L'eau est la première ressource que la démocratie doit garantir.",a:"Franklin D. Roosevelt"},
  {t:"La mer est le premier espace de la coopération internationale.",a:"Hugo Grotius"},
  {t:"L'eau est la première forme de la gratitude envers la nature.",a:"Henry David Thoreau"},
  {t:"La rivière est la première leçon de direction dans la vie.",a:"Confucius"},
  {t:"L'eau est la première ressource de la croissance et de la vie.",a:"Galilée"},
  {t:"La mer est le premier espace de la réconciliation entre peuples.",a:"Kofi Annan"},
  {t:"L'eau est la première forme de la beauté accessible à tous.",a:"Victor Hugo"},
  {t:"La rivière est la première leçon de détermination.",a:"Winston Churchill"},
  {t:"La mer est le premier espace de l'aventure collective.",a:"Jules Verne"},
  {t:"L'eau est la première forme de la douceur conquérante.",a:"Lao Tseu"},
  {t:"L'eau est la première ressource que la corruption vole aux pauvres.",a:"Kofi Annan"},
  {t:"L'eau est la première forme de la compassion universelle.",a:"Bouddha"},
  {t:"La rivière est la première leçon de la relativité du temps.",a:"Albert Einstein"},
  {t:"L'eau est la première ressource de la confiance entre peuples.",a:"Nelson Mandela"},
  {t:"La mer est le premier espace de la découverte mutuelle.",a:"Charles Darwin"},
  {t:"L'eau est la première forme de la générosité sans frontière.",a:"Gandhi"},
  {t:"L'eau est la première ressource de la sécurité alimentaire mondiale.",a:"Organisation des Nations Unies"},
  {t:"L'eau est la première form de la vie partagée.",a:"Albert Schweitzer"},
  {t:"La rivière est la première leçon de la beauté du mouvement.",a:"Léonard de Vinci"},
  {t:"L'eau est la première ressource de l'espérance climatique.",a:"Ban Ki-moon"},
  {t:"La mer est le premier espace du rêve humain.",a:"Victor Hugo"},
  {t:"L'eau est la première forme de la promesse tenue par la nature.",a:"Henry David Thoreau"},
  {t:"La rivière est la première leçon de la sagesse populaire.",a:"Proverbe bambara"},
  {t:"L'eau est la première ressource de la cohésion sociale.",a:"Barack Obama"},
  {t:"La mer est le premier espace de l'émerveillement.",a:"Jacques-Yves Cousteau"},
  {t:"L'eau est la première ressource que l'amour protège.",a:"Khalil Gibran"},
  {t:"La rivière est la première leçon de la coexistence pacifique des contraires.",a:"Héraclite"},
  {t:"L'eau est la première form de la force silencieuse.",a:"Laozi"},
  {t:"L'eau creuse le rocher à force de persévérance.",a:"Ovide"},
  {t:"L'eau est la première ressource de la renaissance de la nature.",a:"Henry David Thoreau"},
  {t:"La mer est le premier horizon de toute aventure humaine.",a:"Herman Melville"},
  {t:"L'eau est la première leçon de l'humilité pour les conquérants.",a:"Alexandre le Grand"},
  {t:"La rivière est la première messagère de la montagne vers la mer.",a:"Khalil Gibran"},
  {t:"L'eau est la première ressource de tout jardin de civilisation.",a:"Confucius"},
  {t:"L'eau est plus forte que la volonté des hommes.",a:"Héraclite"},
  {t:"La mer lave toutes les souillures du monde.",a:"Euripide"},
  {t:"L'eau qui dort cache des profondeurs insoupçonnées.",a:"Proverbe japonais"},
  {t:"La rivière est la patience de la montagne rendue visible.",a:"Laozi"},
  {t:"L'eau est le premier remède à l'orgueil humain.",a:"Blaise Pascal"},
  {t:"La mer est le poème que la Terre récite au ciel.",a:"Pablo Neruda"},
  {t:"L'eau est la première preuve que la douceur peut façonner le monde.",a:"Lao Tseu"},
  {t:"La rivière ne revient jamais sur ses pas.",a:"Héraclite"},
  {t:"L'eau est la première ressource partagée sans frontière.",a:"Kofi Annan"},
  {t:"La mer est la leçon que la Terre donne à l'infini.",a:"Victor Hugo"},
  {t:"L'eau est le premier ami de la vie.",a:"Aristote"},
  {t:"La rivière unit ce que les hommes divisent.",a:"Wangari Maathai"},
  {t:"L'eau est la première ressource que la sagesse ménage.",a:"Confucius"},
  {t:"La mer est le premier espace de la liberté indomptée.",a:"Herman Melville"},
  {t:"L'eau est la première force tranquille de la planète.",a:"Gaston Bachelard"},
  {t:"La rivière est le premier chemin que l'homme n'a pas eu à tracer.",a:"Hérodote"},
  {t:"L'eau est la première forme de la douceur conquérante de la nature.",a:"Lao Tseu"},
  {t:"La mer est le premier horizon que l'homme ait osé franchir.",a:"Jules Verne"},
  {t:"L'eau est la première preuve que la vie peut surgir du néant.",a:"Carl Sagan"},
  {t:"La mer est la plus ancienne des routes commerciales.",a:"Hérodote"},
  {t:"L'eau est la première leçon de géopolitique : qui la contrôle contrôle la vie.",a:"Kofi Annan"},
  {t:"La rivière ne connaît pas la honte de serpenter.",a:"Lao Tseu"},
  {t:"L'eau est la première ressource que l'amour collectif préserve.",a:"Gandhi"},
  {t:"La mer est le premier espace où l'homme a compris qu'il était petit.",a:"Blaise Pascal"},
  {t:"L'eau est la première richesse que la coopération internationale doit protéger.",a:"Ban Ki-moon"},
];

const QR = [
  {t:"Nous n'héritons pas la Terre de nos ancêtres, nous l'empruntons à nos enfants.",a:"Antoine de Saint-Exupéry"},
  {t:"La Terre ne nous appartient pas, nous lui appartenons.",a:"Sitting Bull"},
  {t:"Agis de façon que les effets de ton action soient compatibles avec la permanence d'une vie humaine authentique.",a:"Hans Jonas"},
  {t:"Le recyclage est le minimum que nous puissions faire pour la planète.",a:"David Attenborough"},
  {t:"Penser globalement, agir localement.",a:"René Dubos"},
  {t:"La nature ne produit pas de déchets, inspirons-nous d'elle.",a:"Buckminster Fuller"},
  {t:"Le meilleur déchet est celui qu'on ne produit pas.",a:"Programme ONU Environnement"},
  {t:"Réduire, réutiliser, recycler.",a:"Programme ONU Environnement"},
  {t:"Chaque bouteille recyclée est un vote pour la planète.",a:"Al Gore"},
  {t:"Le vrai pollueur est celui qui sait et ne fait rien.",a:"Greta Thunberg"},
  {t:"Nos choix d'aujourd'hui sont les conditions de vie de demain.",a:"Nicolas Hulot"},
  {t:"La Terre n'est pas un héritage de nos parents, c'est un emprunt de nos enfants.",a:"Proverbe amérindien"},
  {t:"Le recyclage est une révolution tranquille mais radicale.",a:"Paul Hawken"},
  {t:"Un plastique mal géré est une bombe à retardement pour nos océans.",a:"David Attenborough"},
  {t:"Chaque geste de recyclage est un acte d'amour pour la planète.",a:"Jane Goodall"},
  {t:"Nous sommes la première génération à sentir les effets du changement climatique.",a:"Barack Obama"},
  {t:"La pollution est le signe que les ressources ne sont pas utilisées correctement.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est refuser la fatalité du gaspillage.",a:"Hubert Reeves"},
  {t:"La Terre ne peut pas attendre nos bonnes intentions. Elle a besoin de nos actes.",a:"Wangari Maathai"},
  {t:"Il n'y a pas de petits gestes quand il s'agit de la planète.",a:"Yann Arthus-Bertrand"},
  {t:"Un déchet n'est qu'une ressource mal placée.",a:"Antoine Lavoisier"},
  {t:"Recycler, c'est donner une deuxième chance à la matière.",a:"Ellen MacArthur"},
  {t:"La pollution plastique est l'une des plus grandes menaces des temps modernes.",a:"Erik Solheim"},
  {t:"Chaque emballage retourné est une victoire contre la pollution.",a:"Al Gore"},
  {t:"L'avenir appartient à ceux qui comprennent que créer et conserver sont liés.",a:"Wendell Berry"},
  {t:"Le déchet de l'un est la ressource de l'autre.",a:"Walter Stahel"},
  {t:"La nature ne se recycle pas en un jour. Aidons-la.",a:"David Suzuki"},
  {t:"Le recyclage est la responsabilité que chaque citoyen doit assumer.",a:"Kofi Annan"},
  {t:"Un plastique recyclé aujourd'hui, c'est un poisson sauvé demain.",a:"Sylvia Earle"},
  {t:"Recycler, c'est créer une économie qui ne gaspille pas.",a:"Ellen MacArthur"},
  {t:"Nous sommes la solution au problème de pollution.",a:"Greenpeace"},
  {t:"L'environnement est où nous vivons tous. Le développement est ce que nous faisons tous.",a:"Gro Harlem Brundtland"},
  {t:"Moins on consomme, plus on conserve.",a:"Henry David Thoreau"},
  {t:"Le plastique ne disparaît pas, il se fragmente. Empêchons-le de commencer.",a:"David Attenborough"},
  {t:"Recycler est un acte de foi envers l'avenir.",a:"Jane Goodall"},
  {t:"Chaque geste compte dans la lutte contre le gaspillage.",a:"Nicolas Hulot"},
  {t:"La propreté de la planète commence dans nos foyers.",a:"Wangari Maathai"},
  {t:"Un monde sans déchets est un monde possible.",a:"Paul Hawken"},
  {t:"Recycler, c'est écrire une lettre d'amour à ses enfants.",a:"Carl Sagan"},
  {t:"Nous avons l'obligation morale de protéger notre seul foyer commun.",a:"Pape François"},
  {t:"La protection de l'environnement est une responsabilité collective.",a:"Nelson Mandela"},
  {t:"Le recyclage est la première étape de l'économie circulaire.",a:"Ellen MacArthur"},
  {t:"Chaque bouteille vide a un destin. C'est vous qui le choisissez.",a:"Yann Arthus-Bertrand"},
  {t:"Recycler, c'est voter pour un avenir vivable.",a:"Bill McKibben"},
  {t:"La nature est une école. Elle nous apprend que rien ne se perd.",a:"Antoine Lavoisier"},
  {t:"La pollution est la maladie de la société consumériste.",a:"Barry Commoner"},
  {t:"Il n'y a pas de planète B.",a:"Ban Ki-moon"},
  {t:"Recycler est la moindre des choses que nous puissions faire pour nos enfants.",a:"Al Gore"},
  {t:"Un déchet recyclé est une ressource retrouvée.",a:"Gunter Pauli"},
  {t:"La propreté de demain se construit dans les gestes d'aujourd'hui.",a:"Wangari Maathai"},
  {t:"Recycler, c'est transformer un problème en solution.",a:"Bill Nye"},
  {t:"Nos déchets racontent qui nous sommes. Racontons une belle histoire.",a:"David Suzuki"},
  {t:"Recycler, c'est refuser de fermer les yeux sur notre impact.",a:"Greta Thunberg"},
  {t:"Un plastique recyclé, c'est un écosystème protégé.",a:"Sylvia Earle"},
  {t:"La Terre a des ressources pour les besoins de tous, pas pour les désirs de quelques-uns.",a:"Gandhi"},
  {t:"Recycler, c'est être responsable de sa propre empreinte.",a:"Barack Obama"},
  {t:"Chaque déchet non recyclé est une dette envers la nature.",a:"Hubert Reeves"},
  {t:"Recycler, c'est le minimum syndical de l'écologie.",a:"Nicolas Hulot"},
  {t:"Le changement climatique est réel. Agissons maintenant.",a:"Kofi Annan"},
  {t:"Un emballage retourné est un cadeau fait à la planète.",a:"Jane Goodall"},
  {t:"La pollution plastique est la cicatrice de notre insouciance.",a:"David Attenborough"},
  {t:"Recycler, c'est transformer la culpabilité en action.",a:"Paul Hawken"},
  {t:"Le tri des déchets est le premier pas vers un monde durable.",a:"Ellen MacArthur"},
  {t:"Chaque kilogramme de plastique recyclé est une victoire.",a:"Erik Solheim"},
  {t:"Recycler, c'est l'acte le plus concret de l'amour de la nature.",a:"Wangari Maathai"},
  {t:"La nature nous a tout donné. Rendons-lui ce que nous lui devons.",a:"Albert Schweitzer"},
  {t:"Recycler, c'est croire que demain peut être meilleur qu'aujourd'hui.",a:"Carl Sagan"},
  {t:"Un déchet récupéré est une ressource économisée.",a:"Walter Stahel"},
  {t:"La pollution est le signe d'un monde qui ne respecte pas ses propres lois.",a:"Aldo Leopold"},
  {t:"Recycler, c'est s'inscrire dans le cycle naturel de la matière.",a:"Antoine Lavoisier"},
  {t:"Chaque geste écologique est un vote pour la biodiversité.",a:"Edward O. Wilson"},
  {t:"La Terre est malade de notre insouciance. Le recyclage est un remède.",a:"Hubert Reeves"},
  {t:"Recycler, c'est mettre ses valeurs en actes.",a:"Gandhi"},
  {t:"Un monde propre commence par des citoyens responsables.",a:"Nelson Mandela"},
  {t:"Chaque plastique qui n'est pas recyclé finit par nuire à la vie.",a:"Sylvia Earle"},
  {t:"La planète n'a pas besoin de plus d'héros, mais de plus de citoyens responsables.",a:"David Suzuki"},
  {t:"Recycler, c'est agir au lieu de subir.",a:"Greta Thunberg"},
  {t:"Un déchet recyclé est une promesse tenue envers l'avenir.",a:"Jane Goodall"},
  {t:"La pollution est le vrai terrorisme de masse.",a:"Robert Redford"},
  {t:"Recycler, c'est respecter le labeur de la nature.",a:"Henry David Thoreau"},
  {t:"Chaque citoyen a le pouvoir de changer les choses par ses gestes.",a:"Barack Obama"},
  {t:"La biodiversité est l'assurance-vie de l'humanité. Préservons-la.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est comprendre que rien n'est vraiment une fin.",a:"Antoine Lavoisier"},
  {t:"Un monde sans pollution est un droit pour nos enfants.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est rendre à la matière sa dignité.",a:"Buckminster Fuller"},
  {t:"La durabilité n'est pas une option, c'est une nécessité.",a:"Gro Harlem Brundtland"},
  {t:"Recycler, c'est honorer le sacrifice de la nature.",a:"Albert Schweitzer"},
  {t:"Chaque déchet a une histoire. Faisons en sorte qu'elle se poursuive.",a:"Ellen MacArthur"},
  {t:"La nature ne peut pas reconstruire en un siècle ce que nous détruisons en un an.",a:"David Attenborough"},
  {t:"Recycler, c'est écrire l'avenir au lieu de le subir.",a:"Wangari Maathai"},
  {t:"Un geste de recyclage vaut mille discours écologiques.",a:"Nicolas Hulot"},
  {t:"La pollution est la preuve que l'économie a oublié la nature.",a:"Barry Commoner"},
  {t:"Recycler, c'est transformer la conscience en geste.",a:"Carl Sagan"},
  {t:"Chaque matière recyclée est une histoire de renaissance.",a:"Gunter Pauli"},
  {t:"La planète mérite notre respect, pas notre gaspillage.",a:"Pape François"},
  {t:"Un déchet non recyclé est une trahison envers nos enfants.",a:"Al Gore"},
  {t:"La nature attend notre aide. Le recyclage est notre réponse.",a:"Jane Goodall"},
  {t:"Recycler, c'est prouver que l'efficacité et la responsabilité sont compatibles.",a:"Ellen MacArthur"},
  {t:"Chaque bouteille récupérée est un pas vers l'économie circulaire.",a:"Walter Stahel"},
  {t:"La pollution est la signature d'une civilisation irresponsable.",a:"Aldo Leopold"},
  {t:"Recycler, c'est inscrire son nom dans le livre de la responsabilité.",a:"Barack Obama"},
  {t:"Un monde durable est un monde où le déchet n'existe plus.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est participer à la plus grande révolution silencieuse.",a:"Paul Hawken"},
  {t:"Chaque geste de tri est un acte de résistance contre le gaspillage.",a:"Greta Thunberg"},
  {t:"La Terre ne peut pas recycler à notre rythme. Ralentissons.",a:"David Suzuki"},
  {t:"Recycler, c'est prouver que la croissance peut rimer avec responsabilité.",a:"Gro Harlem Brundtland"},
  {t:"Un déchet recyclé est une matière réconciliée avec son destin naturel.",a:"Antoine Lavoisier"},
  {t:"La nature est l'architecte de la durabilité. Copions-la.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est l'action la plus concrète contre l'indifférence écologique.",a:"Hubert Reeves"},
  {t:"Chaque tonne de plastique recyclée est une victoire de l'intelligence sur l'insouciance.",a:"Erik Solheim"},
  {t:"La durabilité est la promesse la plus importante que nous puissions tenir.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est faire de chaque fin un nouveau commencement.",a:"Carl Sagan"},
  {t:"Un emballage recyclé est une vie prolongée donnée à la matière.",a:"Ellen MacArthur"},
  {t:"La pollution plastique est notre legs honteux si nous ne réagissons pas.",a:"David Attenborough"},
  {t:"Recycler, c'est transformer l'acte quotidien en acte civilisationnel.",a:"Wangari Maathai"},
  {t:"Chaque citoyen qui recycle est un constructeur du monde futur.",a:"Nelson Mandela"},
  {t:"La propreté de l'environnement est la première forme de dignité collective.",a:"Gandhi"},
  {t:"Recycler, c'est refuser d'hypothéquer l'avenir de nos enfants.",a:"Al Gore"},
  {t:"Un geste de recyclage quotidien bâtit un monde meilleur lentement mais sûrement.",a:"Jane Goodall"},
  {t:"La nature cycle tout. L'homme doit apprendre à faire de même.",a:"Antoine Lavoisier"},
  {t:"Recycler, c'est le premier acte de patriotisme planétaire.",a:"Carl Sagan"},
  {t:"Chaque déchet recyclé témoigne de notre intelligence collective.",a:"Edward O. Wilson"},
  {t:"La pollution est le signe que l'économie a perdu le sens du long terme.",a:"John Maynard Keynes"},
  {t:"Recycler, c'est donner à la matière une deuxième chance de servir.",a:"Gunter Pauli"},
  {t:"Un monde propre est un droit que chaque geste de recyclage construit.",a:"Barack Obama"},
  {t:"La durabilité est l'intelligence de l'espèce humaine appliquée à sa survie.",a:"Gro Harlem Brundtland"},
  {t:"Recycler, c'est inscrire sa vie dans le grand cycle de la nature.",a:"Henry David Thoreau"},
  {t:"Chaque plastique récupéré est un enfant protégé.",a:"Pape François"},
  {t:"Recycler, c'est transformer le présent irresponsable en futur durable.",a:"Wangari Maathai"},
  {t:"Un déchet recyclé est une promesse honorée envers la nature.",a:"Albert Schweitzer"},
  {t:"La pollution est la taxe que nous payons pour notre irresponsabilité.",a:"Barry Commoner"},
  {t:"Recycler, c'est choisir d'être du bon côté de l'histoire.",a:"Barack Obama"},
  {t:"Chaque matière première économisée est une ressource préservée pour demain.",a:"Ellen MacArthur"},
  {t:"La biodiversité se protège aussi par nos gestes de recyclage.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est la plus simple des révolutions.",a:"Greta Thunberg"},
  {t:"Un monde sans déchets commence par une conscience sans indifférence.",a:"Nelson Mandela"},
  {t:"La Terre souffre de notre excès. Recyclons pour alléger sa peine.",a:"Hubert Reeves"},
  {t:"Recycler, c'est agir à la hauteur de notre intelligence.",a:"Carl Sagan"},
  {t:"Chaque geste écologique est une phrase dans le poème du futur.",a:"Rabindranath Tagore"},
  {t:"La pollution plastique est la marque de notre époque. Changeons-la.",a:"David Attenborough"},
  {t:"Recycler, c'est refuser de capituler devant le gaspillage.",a:"Paul Hawken"},
  {t:"Un déchet bien trié est un citoyen responsable exprimé.",a:"Nicolas Hulot"},
  {t:"La nature est la seule économie qui fonctionne sans dette.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est comprendre que tout est lié dans la nature.",a:"Aldo Leopold"},
  {t:"Chaque plastique récupéré est une vie aquatique sauvée.",a:"Sylvia Earle"},
  {t:"La durabilité est la forme la plus haute de l'intelligence collective.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est faire de la chimie dans la vie réelle.",a:"Antoine Lavoisier"},
  {t:"Un monde recyclé est un monde qui se respecte.",a:"Gandhi"},
  {t:"La planète a besoin de moins de consommateurs et plus de citoyens.",a:"David Suzuki"},
  {t:"Recycler, c'est l'anticonformisme de ceux qui aiment la vie.",a:"Greta Thunberg"},
  {t:"Chaque tonne de déchets recyclée est une tonne d'espoir.",a:"Jane Goodall"},
  {t:"La pollution de demain se prépare dans l'indifférence d'aujourd'hui.",a:"David Attenborough"},
  {t:"Recycler, c'est honorer les générations qui viendront après nous.",a:"Wangari Maathai"},
  {t:"Un déchet recyclé est la preuve que l'acte humain peut réparer.",a:"Albert Schweitzer"},
  {t:"La propreté de la planète est une conquête quotidienne.",a:"Pape François"},
  {t:"Recycler, c'est la forme la plus humble du génie humain.",a:"Albert Einstein"},
  {t:"Chaque geste de recyclage est une ligne écrite dans le livre de l'avenir.",a:"Carl Sagan"},
  {t:"La Terre est un être vivant. Le recyclage est notre façon de la soigner.",a:"James Lovelock"},
  {t:"Un plastique récupéré est un océan qui respire mieux.",a:"Sylvia Earle"},
  {t:"La durabilité est la forme la plus concrète de la fraternité universelle.",a:"Nelson Mandela"},
  {t:"Recycler, c'est mettre la logique de la nature au service de l'homme.",a:"Antoine Lavoisier"},
  {t:"Chaque bouteille récupérée est un enfant qui aura de l'eau propre.",a:"Ban Ki-moon"},
  {t:"La pollution est l'insulte ultime que l'homme fait à la nature.",a:"Aldo Leopold"},
  {t:"Recycler, c'est écrire la bonne fin de l'histoire de l'humanité.",a:"Barack Obama"},
  {t:"Un déchet recyclé est une ressource retrouvée pour la civilisation.",a:"Ellen MacArthur"},
  {t:"La planète ne nous demande pas grand-chose, juste de ne pas la détruire.",a:"David Attenborough"},
  {t:"Recycler, c'est le geste minimum d'une conscience maximale.",a:"Hubert Reeves"},
  {t:"La biodiversité est notre patrimoine le plus précieux. Protégeons-la.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est comprendre que la fin d'un produit est le début d'une ressource.",a:"Walter Stahel"},
  {t:"Un monde durable commence dans le bac de tri de chaque foyer.",a:"Nicolas Hulot"},
  {t:"La nature recycle depuis des milliards d'années. C'est notre tour.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est transformer l'acte anodin en acte héroïque.",a:"Jane Goodall"},
  {t:"Chaque geste de recyclage est un investissement dans la vie.",a:"Carl Sagan"},
  {t:"La pollution est la conséquence d'un monde qui n'a pas appris à recycler.",a:"Barry Commoner"},
  {t:"Recycler, c'est donner corps à ses convictions environnementales.",a:"Greta Thunberg"},
  {t:"Un déchet récupéré est une matière qui a échappé à l'oubli.",a:"Paul Hawken"},
  {t:"La Terre est notre seul foyer. Prenons-en soin.",a:"Pape François"},
  {t:"Recycler, c'est la solidarité entre les générations.",a:"Nelson Mandela"},
  {t:"Chaque plastique non recyclé est une dette que nous léguons à nos enfants.",a:"Al Gore"},
  {t:"La propreté commence par la conscience et finit par le geste.",a:"Gandhi"},
  {t:"Recycler, c'est refuser que la nature paie pour nos erreurs.",a:"Wangari Maathai"},
  {t:"Un monde propre est une conquête quotidienne, pas un don.",a:"Albert Einstein"},
  {t:"La durabilité n'est pas un luxe, c'est une exigence de survie.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est le premier acte d'une économie qui respecte la vie.",a:"Ellen MacArthur"},
  {t:"Chaque emballage recyclé est un maillon de la chaîne de l'espoir.",a:"Sylvia Earle"},
  {t:"La pollution est la plus injuste des taxes : les pauvres la subissent sans l'avoir créée.",a:"Barack Obama"},
  {t:"Recycler, c'est être du côté de la vie.",a:"Albert Schweitzer"},
  {t:"Un déchet trié est un geste de civilisation.",a:"Hubert Reeves"},
  {t:"La planète est notre mère. Ne la polluons pas.",a:"Proverbe amérindien"},
  {t:"Recycler, c'est la forme la plus simple de l'amour de l'avenir.",a:"Carl Sagan"},
  {t:"Chaque matière première recyclée est un cadeau fait à demain.",a:"Gro Harlem Brundtland"},
  {t:"La nature souffre en silence. Le recyclage est notre façon de l'écouter.",a:"James Lovelock"},
  {t:"Recycler, c'est comprendre que la liberté s'arrête où commence la pollution d'autrui.",a:"Voltaire"},
  {t:"Un plastique recyclé est un acte de résistance contre le consumérisme.",a:"Naomi Klein"},
  {t:"La pollution est la cicatrice visible de notre irresponsabilité.",a:"Aldo Leopold"},
  {t:"Recycler, c'est transformer chaque fin de vie en début de nouvelle vie.",a:"Antoine Lavoisier"},
  {t:"Chaque geste écologique est un vote pour la biodiversité future.",a:"Edward O. Wilson"},
  {t:"La durabilité est le test de maturité d'une civilisation.",a:"Paul Hawken"},
  {t:"Un déchet recyclé est la preuve que l'acte individuel a une portée collective.",a:"Barack Obama"},
  {t:"La planète a besoin de moins de consommation et plus de conscience.",a:"David Suzuki"},
  {t:"Recycler, c'est l'économie de l'intelligence appliquée à la matière.",a:"Walter Stahel"},
  {t:"Chaque bouteille vide retournée est un enfant qui grandira dans un monde plus propre.",a:"Jane Goodall"},
  {t:"La pollution est le prix que nous payons pour notre indifférence collective.",a:"Barry Commoner"},
  {t:"Recycler, c'est refuser de capituler devant la logique du jetable.",a:"Naomi Klein"},
  {t:"Un monde sans déchets est le rêve que chaque geste de recyclage bâtit.",a:"Ellen MacArthur"},
  {t:"La nature nous a tout prêté. Le recyclage est le début du remboursement.",a:"Henry David Thoreau"},
  {t:"Recycler, c'est la forme la plus concrète du respect de la vie.",a:"Albert Schweitzer"},
  {t:"Chaque matière recyclée est une ressource que la nature ne doit pas refabriquer.",a:"Antoine Lavoisier"},
  {t:"La biodiversité est la richesse que le recyclage contribue à préserver.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est agir avec la sagesse que la nature nous a enseignée.",a:"Lao Tseu"},
  {t:"Un déchet recyclé est la preuve que l'intelligence humaine est au service de la vie.",a:"Carl Sagan"},
  {t:"La durabilité est la condition de la liberté des générations futures.",a:"Hans Jonas"},
  {t:"Recycler, c'est transformer son impact négatif en impact positif.",a:"Greta Thunberg"},
  {t:"Chaque plastique récupéré est un engagement tenu envers la planète.",a:"Al Gore"},
  {t:"La planète a survécu à des météorites. Elle ne survivra pas à notre indifférence.",a:"David Attenborough"},
  {t:"Recycler, c'est l'acte le plus démocratique de l'écologie.",a:"Nelson Mandela"},
  {t:"Un geste de recyclage est un mot dans le discours de la responsabilité.",a:"Barack Obama"},
  {t:"La propreté de l'environnement est la première des libertés.",a:"Gandhi"},
  {t:"Chaque tonne de plastique recyclée est une victoire de la conscience sur la commodité.",a:"Jane Goodall"},
  {t:"La pollution est la preuve que l'humanité n'a pas encore atteint sa maturité.",a:"Albert Einstein"},
  {t:"Recycler, c'est être l'auteur et non la victime de son impact sur la planète.",a:"Wangari Maathai"},
  {t:"Un monde recyclé est un monde qui a compris la valeur de ce qu'il possède.",a:"Paul Hawken"},
  {t:"La Terre a des ressources pour répondre aux besoins, pas aux avidités.",a:"Gandhi"},
  {t:"Recycler, c'est le premier pas vers une économie qui ne détruit pas.",a:"Ellen MacArthur"},
  {t:"Chaque emballage recyclé envoie un signal à l'industrie : changez vos pratiques.",a:"Naomi Klein"},
  {t:"La durabilité est la première forme d'intelligence collective.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est honorer le travail de la nature sur des millions d'années.",a:"Aldo Leopold"},
  {t:"Un déchet recyclé est une ressource qui a évité la mort prématurée.",a:"Walter Stahel"},
  {t:"La planète nous observe. Le recyclage est notre meilleure réponse.",a:"James Lovelock"},
  {t:"Recycler, c'est la première étape vers une civilisation qui dure.",a:"Arnold Toynbee"},
  {t:"Chaque geste de tri est une brique dans le mur de la durabilité.",a:"Gro Harlem Brundtland"},
  {t:"La nature ne jette rien. L'homme a beaucoup à apprendre d'elle.",a:"Antoine Lavoisier"},
  {t:"Recycler, c'est inscrire son existence dans un projet collectif durable.",a:"Carl Sagan"},
  {t:"Un plastique non recyclé est une hypothèque sur l'avenir de nos enfants.",a:"Barack Obama"},
  {t:"La biodiversité est notre meilleure assurance contre l'incertitude.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est apporter sa contribution à la plus grande cause de notre temps.",a:"Greta Thunberg"},
  {t:"Chaque déchet recyclé est une dette remboursée envers la planète.",a:"Al Gore"},
  {t:"La pollution est le langage de ceux qui ont renoncé à penser à demain.",a:"Hubert Reeves"},
  {t:"Recycler, c'est agir comme si chaque geste comptait. Parce qu'il compte.",a:"Jane Goodall"},
  {t:"Un monde durable est construit geste après geste, déchet après déchet recyclé.",a:"Nelson Mandela"},
  {t:"La propreté de notre planète est aussi une question de justice sociale.",a:"Martin Luther King Jr."},
  {t:"Recycler, c'est la forme la plus modeste et la plus efficace du militantisme.",a:"David Suzuki"},
  {t:"Chaque matière recyclée est un chapitre de l'économie circulaire.",a:"Ellen MacArthur"},
  {t:"La Terre ne souffrira pas de notre recyclage. Elle souffrira de notre inaction.",a:"Pape François"},
  {t:"Recycler, c'est refuser d'hériter d'un monde pollué et refuser de le transmettre tel quel.",a:"Wangari Maathai"},
  {t:"Un déchet trié est le premier signe d'une société qui se respecte.",a:"Nicolas Hulot"},
  {t:"La planète mérite mieux que nos déchets.",a:"Sylvia Earle"},
  {t:"Recycler, c'est construire la maison que nos enfants habitueront.",a:"Albert Schweitzer"},
  {t:"Chaque emballage récupéré est une victoire contre l'oubli environnemental.",a:"Barry Commoner"},
  {t:"La durabilité est le cadeau le plus précieux que nous puissions offrir à l'avenir.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est comprendre que la matière est trop précieuse pour ne servir qu'une fois.",a:"Walter Stahel"},
  {t:"Un monde propre est le projet le plus collectif de l'humanité.",a:"Barack Obama"},
  {t:"La pollution plastique n'est pas une fatalité, c'est un choix que nous pouvons corriger.",a:"David Attenborough"},
  {t:"Recycler, c'est transformer chaque geste du quotidien en acte de civilisation.",a:"Gandhi"},
  {t:"Chaque plastique recyclé est un message d'espoir envoyé aux générations futures.",a:"Carl Sagan"},
  {t:"La nature est patiente. Mais notre patience envers elle ne doit pas avoir de limites.",a:"James Lovelock"},
  {t:"Recycler, c'est la forme la plus universelle de la responsabilité.",a:"Nelson Mandela"},
  {t:"Un geste de recyclage unit tous les hommes dans le même projet de survie.",a:"Kofi Annan"},
  {t:"La propreté de l'environnement est la condition de la dignité humaine.",a:"Gandhi"},
  {t:"Recycler, c'est écrire le mot respect dans la langue des actes.",a:"Greta Thunberg"},
  {t:"Chaque déchet recyclé témoigne de notre capacité à nous améliorer.",a:"Albert Einstein"},
  {t:"La durabilité est l'horizon que chaque geste de recyclage rapproche.",a:"Ellen MacArthur"},
  {t:"Recycler, c'est le geste le plus ancien de l'écologie moderne.",a:"Antoine Lavoisier"},
  {t:"Un plastique récupéré est un enfant qui pourra nager dans un océan propre.",a:"Sylvia Earle"},
  {t:"La pollution est la preuve que l'humanité n'a pas encore appris à vivre.",a:"Aldo Leopold"},
  {t:"Recycler, c'est agir avec la cohérence que nos valeurs exigent.",a:"Barack Obama"},
  {t:"Chaque bouteille vide récupérée est un signal envoyé à la planète : nous t'entendons.",a:"Jane Goodall"},
  {t:"La planète a besoin de nos actes, pas de nos regrets.",a:"Wangari Maathai"},
  {t:"Recycler, c'est transformer chaque fin de vie d'un produit en renaissance.",a:"Buckminster Fuller"},
  {t:"Un monde durable est un monde où les déchets nourrissent d'autres cycles.",a:"Gunter Pauli"},
  {t:"La biodiversité est le tissu de la vie. Le recyclage contribue à le préserver.",a:"Edward O. Wilson"},
  {t:"Recycler, c'est le premier commandement de l'écologie citoyenne.",a:"Nicolas Hulot"},
  {t:"Chaque matière recyclée est un pas vers une économie qui respecte ses limites.",a:"Gro Harlem Brundtland"},
  {t:"La pollution est la dette que nous n'avons pas le droit de contracter.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est vivre en accord avec les lois de la nature.",a:"Henry David Thoreau"},
  {t:"Un déchet recyclé est la preuve que notre intelligence peut compenser nos excès.",a:"Carl Sagan"},
  {t:"La durabilité est l'objectif le plus noble que l'humanité puisse poursuivre.",a:"Pape François"},
  {t:"Recycler, c'est donner à la matière la plus belle des secondes chances.",a:"Ellen MacArthur"},
  {t:"Chaque geste de recyclage est un investissement dans la beauté du monde.",a:"John Keats"},
  {t:"La planète n'a pas besoin de nos excuses, elle a besoin de nos actions.",a:"Greta Thunberg"},
  {t:"Recycler, c'est refuser que la commodité détruise l'avenir.",a:"Naomi Klein"},
  {t:"Un monde recyclé est un monde qui a choisi de durer.",a:"Nelson Mandela"},
  {t:"La nature nous demande peu : juste de ne pas détruire ce qu'elle a mis des millénaires à créer.",a:"David Attenborough"},
  {t:"Recycler, c'est l'acte le plus humble et le plus puissant à la fois.",a:"Albert Schweitzer"},
  {t:"Chaque déchet bien trié est une pierre posée dans l'édifice du futur.",a:"Paul Hawken"},
  {t:"Recycler, c'est choisir l'intelligence collective contre l'individualisme destructeur.",a:"Barack Obama"},
  {t:"Un plastique recyclé est un sourire rendu à la planète.",a:"Jane Goodall"},
  {t:"La durabilité est la forme la plus avancée de la civilisation humaine.",a:"Arnold Toynbee"},
  {t:"Recycler, c'est transformer la culpabilité écologique en action concrète.",a:"Hubert Reeves"},
  {t:"Chaque emballage récupéré est un engagement pour les générations futures.",a:"Kofi Annan"},
  {t:"La planète nous juge à nos actes, pas à nos intentions.",a:"Gandhi"},
  {t:"Recycler, c'est faire de la chimie citoyenne.",a:"Antoine Lavoisier"},
  {t:"Un déchet recyclé est la plus belle réponse à la question environnementale.",a:"Albert Einstein"},
  {t:"La protection de la nature est la condition de la protection de l'homme.",a:"Albert Schweitzer"},
  {t:"Recycler, c'est agir pour que la Terre reste habitable.",a:"Carl Sagan"},
  {t:"Chaque plastique non recyclé est une injure faite à la beauté du monde.",a:"Yann Arthus-Bertrand"},
  {t:"La durabilité est la signature d'une civilisation responsable.",a:"Gro Harlem Brundtland"},
  {t:"Recycler, c'est l'acte le plus démocratique qui soit : chacun peut le faire.",a:"Barack Obama"},
  {t:"Un monde propre est la première richesse d'un peuple.",a:"Gandhi"},
  {t:"La nature nous donne tout gratuitement. Recyclons au moins ses dons.",a:"David Suzuki"},
  {t:"Recycler, c'est refuser l'héritage empoisonné de l'insouciance.",a:"Hans Jonas"},
  {t:"Chaque citoyen qui recycle est un militant de la vie.",a:"Jane Goodall"},
  {t:"La pollution est la preuve que l'économie de marché n'a pas encore trouvé ses limites.",a:"Barry Commoner"},
  {t:"Recycler, c'est inscrire son geste dans le temps long de la civilisation.",a:"Arnold Toynbee"},
  {t:"Un déchet recyclé est la preuve que le petit peut changer le grand.",a:"Margaret Mead"},
  {t:"La durabilité est la forme la plus haute de l'amour du prochain.",a:"Pape François"},
  {t:"Recycler, c'est agir comme si demain dépendait de nous. Parce que c'est le cas.",a:"Greta Thunberg"},
  {t:"Chaque tonne recyclée est un pas de plus vers la planète de demain.",a:"Ellen MacArthur"},
  {t:"La Terre parle. Nos déchets sont notre façon de l'ignorer.",a:"James Lovelock"},
  {t:"Recycler, c'est la forme la plus concrète de l'espérance écologique.",a:"Hubert Reeves"},
  {t:"Un plastique récupéré est la preuve que chaque geste a du sens.",a:"Wangari Maathai"},
  {t:"La pollution plastique est le testament de notre irresponsabilité.",a:"David Attenborough"},
  {t:"Recycler, c'est choisir de laisser le monde meilleur qu'on ne l'a trouvé.",a:"Robert Baden-Powell"},
  {t:"Chaque emballage recyclé est un message d'amour à la planète.",a:"Carl Sagan"},
  {t:"La durabilité est l'engagement le plus sérieux que l'on puisse prendre envers l'avenir.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est prouver que l'homme peut apprendre de ses erreurs.",a:"Charles Darwin"},
  {t:"Un monde durable naît d'un geste simple : recycler.",a:"Kofi Annan"},
  {t:"La nature est notre maison commune. Gardons-la propre.",a:"Pape François"},
  {t:"Recycler, c'est la résistance concrète contre la barbarie du gaspillage.",a:"Naomi Klein"},
  {t:"Chaque déchet recyclé porte en lui l'espoir d'un monde meilleur.",a:"Nelson Mandela"},
  {t:"La durabilité commence par un geste : trier, recycler, préserver.",a:"Ellen MacArthur"},
  {t:"Recycler, c'est montrer que la raison peut triompher du confort.",a:"Albert Einstein"},
  {t:"Un plastique récupéré est un acte de résistance contre l'oubli écologique.",a:"Greta Thunberg"},
  {t:"La planète mérite qu'on se batte pour elle. Le recyclage est notre arme.",a:"Jane Goodall"},
  {t:"Recycler, c'est laisser derrière soi des traces de conscience.",a:"Wangari Maathai"},
  {t:"Chaque matière recyclée prouve que l'homme peut être en harmonie avec la nature.",a:"Buckminster Fuller"},
  {t:"La durabilité est la forme la plus noble de la solidarité humaine.",a:"Nelson Mandela"},
  {t:"Recycler, c'est agir à la hauteur de l'héritage que nous voulons laisser.",a:"Barack Obama"},
  {t:"Le recyclage est l'acte de foi le plus concret envers la nature.",a:"Albert Schweitzer"},
  {t:"Chaque déchet recyclé est une promesse faite aux enfants du monde.",a:"Kofi Annan"},
  {t:"La nature attend de nous que nous soyons dignes de ce qu'elle nous offre.",a:"Henry David Thoreau"},
  {t:"Recycler, c'est rembourser une dette contractée sans le savoir.",a:"Hans Jonas"},
  {t:"Un monde propre est le plus beau cadeau qu'une génération puisse faire à la suivante.",a:"Mandela"},
  {t:"Recycler, c'est le premier acte de respect envers la Terre.",a:"David Attenborough"},
  {t:"Un déchet trié est une ressource qui a trouvé sa voie.",a:"Ellen MacArthur"},
  {t:"La pollution est la preuve que nous n'avons pas encore compris notre place dans la nature.",a:"Aldo Leopold"},
  {t:"Recycler, c'est la forme la plus modeste de la révolution verte.",a:"Greta Thunberg"},
  {t:"Chaque matière recyclée est un chapitre supplémentaire dans l'histoire de la vie.",a:"Carl Sagan"},
  {t:"La durabilité est le seul avenir que la planète peut se permettre.",a:"Ban Ki-moon"},
  {t:"Recycler, c'est refuser de rompre le pacte avec les générations futures.",a:"Hans Jonas"},
  {t:"Un monde sans pollution plastique est un monde qui a choisi la vie.",a:"Sylvia Earle"},
  {t:"La propreté de la planète est une affaire de volonté collective.",a:"Nelson Mandela"},
  {t:"Recycler, c'est transformer chaque acte de consommation en acte de responsabilité.",a:"Barack Obama"},
  {t:"Chaque emballage recyclé est un poème écrit à l'encre verte.",a:"Wangari Maathai"},
  {t:"La durabilité est la mesure de notre intelligence comme espèce.",a:"Albert Einstein"},
  {t:"Recycler, c'est prouver que l'homme peut vivre sans détruire.",a:"Jane Goodall"},
  {t:"Un plastique récupéré est la preuve que le geste compte autant que l'intention.",a:"Gandhi"},
  {t:"La pollution est le signe que nous avons oublié que la Terre est vivante.",a:"James Lovelock"},
  {t:"Recycler, c'est inscrire son nom dans le registre des gens qui ont choisi l'avenir.",a:"Carl Sagan"},
  {t:"Chaque tonne recyclée est une dette remboursée à la planète.",a:"Kofi Annan"},
  {t:"La durabilité est le premier devoir de chaque civilisation qui veut durer.",a:"Arnold Toynbee"},
  {t:"Recycler, c'est l'acte quotidien le plus proche de la sagesse écologique.",a:"Henry David Thoreau"},
  {t:"Un déchet non recyclé est la preuve de l'indifférence érigée en système.",a:"Naomi Klein"},
  {t:"La nature ne pollue pas. Apprenons d'elle.",a:"Buckminster Fuller"},
  {t:"Recycler, c'est choisir la sobriété heureuse.",a:"Pierre Rabhi"},
  {t:"Chaque plastique recyclé est un poisson qui vivra.",a:"David Attenborough"},
  {t:"La propreté de demain dépend des gestes d'aujourd'hui.",a:"Wangari Maathai"},
  {t:"Recycler, c'est la première leçon d'économie que la nature nous enseigne.",a:"Antoine Lavoisier"},
  {t:"Un monde durable est le seul monde qui mérite d'être légué.",a:"Nelson Mandela"},
  {t:"La durabilité, c'est vivre comme si demain existait.",a:"Gro Harlem Brundtland"},
  {t:"Recycler, c'est agir maintenant pour que nos enfants puissent agir plus tard.",a:"Barack Obama"},
  {t:"Chaque geste de recyclage est un acte de désobéissance civile contre le gaspillage.",a:"Naomi Klein"},
  {t:"La pollution est le langage silencieux d'une société qui n'a pas appris à dire non.",a:"Barry Commoner"},
  {t:"Recycler, c'est transformer la fin d'un usage en début d'une autre vie.",a:"Ellen MacArthur"},
  {t:"Un plastique recyclé prouve que l'espèce humaine peut apprendre de ses erreurs.",a:"Charles Darwin"},
];

function getDayOfYear(d) {
  const s = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - s) / 86400000);
}
function getQuote(cat, date) {
  const idx = (getDayOfYear(date) - 1 + 730) % 365;
  const list = cat === "Eau" ? QE : QR;
  const q = list[idx % list.length];
  return { text: q.t, author: q.a };
}

/* ---------------------------------------------------------------------- */
/* Données produits (catalogue figé : marque, format, unités par colis,   */
/* prix d'achat fournisseur). Prix de vente & prix détail = paramétrables */
/* ---------------------------------------------------------------------- */
const CATALOG = [
  { brand: "VOLTIC", format: "Bouteille 5L", units: 1, purchase: 800, sell: 1200 },
  { brand: "VOLTIC", format: "Carton 12x1,5L", units: 12, purchase: 3400, sell: 3800 },
  { brand: "VOLTIC", format: "Carton 20x0,75L", units: 20, purchase: 3300, sell: 3800 },
  { brand: "VOLTIC", format: "Carton 24x0,5L", units: 24, purchase: 3400, sell: 3800 },
  { brand: "VOLTIC", format: "Pack 6x1,5L", units: 6, purchase: 1750, sell: 2150 },
  { brand: "VOLTIC", format: "Pack 6x0,75L", units: 6, purchase: 950, sell: 1250 },
  { brand: "VOLTIC", format: "Pack 6x0,5L", units: 6, purchase: 850, sell: 1250 },
  { brand: "VOLTIC", format: "Pack 12x0,33L", units: 12, purchase: 1200, sell: 1600 },
  { brand: "VOLTIC", format: "Pack 40x0,25L", units: 40, purchase: 1300, sell: 1700 },
  { brand: "CRISTAL", format: "Carton 12x1,5L", units: 12, purchase: 3300, sell: 3700 },
  { brand: "CRISTAL", format: "Carton 24x0,5L", units: 24, purchase: 3300, sell: 3700 },
  { brand: "CRISTAL", format: "Pack 6x1,5L", units: 6, purchase: 1650, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 6x1L", units: 6, purchase: 1600, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 12x0,5L", units: 12, purchase: 1650, sell: 2000 },
  { brand: "CRISTAL", format: "Pack 15x0,33L", units: 15, purchase: 1600, sell: 2000 },
  { brand: "EAU VITALE", format: "Carton 12x1,5L", units: 12, purchase: 3300, sell: 3700 },
  { brand: "EAU VITALE", format: "Carton 24x0,5L", units: 24, purchase: 3300, sell: 3700 },
  { brand: "EAU VITALE", format: "Carton 24x0,35L", units: 24, purchase: 3000, sell: 3500 },
];

const INITIAL_STOCK = {
  VOLTIC: [4, 1, 2, 9, 0, 0, 0, 3, 2],
  CRISTAL: [10, 54, 10, 10, 10, 10],
  "EAU VITALE": [6, 7, 6],
};

// TPU (Taxe Professionnelle Unique) — régime applicable à un exploitant
// individuel dont le CA annuel ne dépasse pas 60 M FCFA. Remplace l'IMF,
// l'IRPP, la patente et la TVA pour ce niveau d'activité. Taux "commerce"
// (2,5%) puisque c'est de la revente d'eau embouteillée, pas un service.
// Montant plancher légal : 20 000 F/an, quel que soit le CA réalisé.
const TPU_RATE = 0.025;
const TPU_MINIMUM = 20000;

const EXPENSE_CATEGORIES = [
  "Transport",
  "Communication (crédit/internet)",
  "Électricité / Eau",
  "Loyer",
  "Salaires / main d'œuvre",
  "Entretien matériel",
  "Taxes / impôts",
  "Recyclage (rachat de bouteilles)",
  "Autre",
];

const BRAND_COLOR = {
  VOLTIC: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200" },
  CRISTAL: { dot: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50", ring: "ring-cyan-200" },
  "EAU VITALE": { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
};

// Palette de secours pour toute nouvelle marque ajoutée plus tard (non
// prévue à l'avance) — cycle sur quelques couleurs distinctes.
const FALLBACK_BRAND_COLORS = [
  { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200" },
  { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
  { dot: "bg-lime-500", text: "text-lime-700", bg: "bg-lime-50", ring: "ring-lime-200" },
  { dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50", ring: "ring-indigo-200" },
];
function getBrandColor(brand) {
  if (BRAND_COLOR[brand]) return BRAND_COLOR[brand];
  let hash = 0;
  for (let i = 0; i < (brand || "").length; i++) hash = (hash * 31 + brand.charCodeAt(i)) | 0;
  return FALLBACK_BRAND_COLORS[Math.abs(hash) % FALLBACK_BRAND_COLORS.length];
}

// Liste des marques réellement présentes dans le catalogue (figées +
// ajoutées manuellement plus tard), dans un ordre stable.
function brandsOf(products) {
  const seen = [];
  (products || []).forEach((p) => {
    if (!seen.includes(p.brand)) seen.push(p.brand);
  });
  return seen;
}

// Recyclage : les bouteilles vides sont rachetées à l'unité, quelle que soit
// l'emballage (carton/pack/bouteille) sous lequel cette contenance existe
// dans le catalogue. On extrait donc la contenance d'une bouteille (ex:
// "Carton 12x1,5L" -> 1.5) pour regrouper le stock par marque + contenance,
// plutôt que par article exact.
function capacityOf(product) {
  const match = (product.format || "").match(/(\d+(?:[.,]\d+)?)\s*L\b/);
  if (!match) return 0;
  return parseFloat(match[1].replace(",", "."));
}
function capacityKey(product) {
  return `${product.brand}::${capacityOf(product)}`;
}
function capacityLabel(product) {
  const c = capacityOf(product);
  return `${product.brand} ${c ? c + "L" : product.format}`;
}

// Options de sélection pour le recyclage : une seule ligne par contenance
// distincte d'une marque (ex: "1,5L"), sans mention de carton/pack — pour
// éviter toute confusion, puisque le rachat se fait toujours à l'unité.
function capacityOptionsFor(products, brand) {
  const seen = new Map();
  (products || [])
    .filter((p) => p.brand === brand)
    .forEach((p) => {
      const cap = capacityOf(p);
      if (!seen.has(cap)) seen.set(cap, p.id);
    });
  return Array.from(seen.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([cap, id]) => ({ value: id, label: cap ? `${cap}L` : "Contenance inconnue" }));
}

const round50 = (n) => Math.round(n / 25) * 25;

// Date réelle de démarrage du suivi (stock de départ donné par l'utilisateur).
const START_DATE = "2026-06-10";

function buildDefaultProducts() {
  const counters = {};
  return CATALOG.map((p) => {
    counters[p.brand] = (counters[p.brand] || 0) + 1;
    const idx = counters[p.brand] - 1;
    const id = `${p.brand}-${idx}`;
    return {
      id,
      brand: p.brand,
      format: p.format,
      units: p.units,
      purchase: p.purchase,
      sellPrice: p.sell,
      retailPrice: round50((p.purchase / p.units) * 1.4),
    };
  });
}

// Formate une date en "aaaa-mm-jj" en heure de Lomé (UTC+0, sans heure
// d'été) — volontairement FIXE, indépendante du fuseau horaire réglé sur
// l'appareil de l'utilisateur (ordinateur en heure de France, téléphone en
// heure du Togo, etc.). Sans ça, "aujourd'hui" changeait selon l'appareil.
function localISO(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const todayISO = () => localISO(new Date());

/* Stock est géré en LOTS (FIFO) : chaque entrée de stock (stock initial,   */
/* réappro, ouverture de colis) crée un lot daté, numéroté séquentiellement */
/* PAR PRODUIT (lotNo, persisté dans meta.lotSeqByProduct[productId]) — pas */
/* de compteur global, pour que les numéros restent lisibles pour un même  */
/* article, indépendamment de ce qui se passe ailleurs dans l'app.         */
/* Les ventes consomment d'abord les lots les plus anciens.                 */
function sortLots(lots) {
  return [...lots].sort((a, b) => (a.date === b.date ? a.lotNo - b.lotNo : a.date.localeCompare(b.date)));
}

function nextLotNo(meta, productId) {
  return ((meta.lotSeqByProduct || {})[productId] || 0) + 1;
}

function bumpLotSeq(meta, productId, newSeq) {
  return { ...meta, lotSeqByProduct: { ...(meta.lotSeqByProduct || {}), [productId]: newSeq } };
}

// Quand une action est complètement annulée (colis redevenu intact, réappro
// supprimé sans avoir été touché), on rend le numéro qu'elle avait pris —
// mais seulement s'il s'agit bien du DERNIER numéro attribué à ce produit,
// pour ne jamais créer de doublon avec un lot plus récent encore existant.
function releaseLotNoIfLast(meta, productId, lotNo) {
  const current = (meta.lotSeqByProduct || {})[productId];
  if (current === lotNo) return bumpLotSeq(meta, productId, lotNo - 1);
  return meta;
}

function lotsQty(lots) {
  return (lots || []).reduce((s, l) => s + l.qty, 0);
}

// Coût moyen pondéré actuellement en stock pour un article (aperçu avant vente).
function weightedCost(lots) {
  const arr = lots || [];
  const qty = lotsQty(arr);
  if (qty === 0) return 0;
  return arr.reduce((s, l) => s + l.qty * l.unitCost, 0) / qty;
}

// Total remboursé sur un prêt = somme des remboursements individuels
// enregistrés (chacun peut être supprimé séparément en cas d'erreur).
function repaidAmount(loan) {
  return (loan.repayments || []).reduce((s, r) => s + r.amount, 0);
}

// Consomme `qty` unités en FIFO (plus vieux lots d'abord). Renvoie les lots
// restants + le coût moyen pondéré réellement consommé.
function consumeFifo(lots, qty) {
  const sorted = sortLots(lots || []);
  let remaining = qty;
  let totalCost = 0;
  const updated = [];
  const consumedFrom = [];
  for (const lot of sorted) {
    if (remaining <= 0) {
      updated.push(lot);
      continue;
    }
    const take = Math.min(lot.qty, remaining);
    if (take > 0) {
      totalCost += take * lot.unitCost;
      remaining -= take;
      consumedFrom.push({ id: lot.id, date: lot.date, originalQty: lot.originalQty, unitCost: lot.unitCost, lotNo: lot.lotNo, qtyTaken: take });
    }
    const rest = lot.qty - take;
    if (rest > 0) updated.push({ ...lot, qty: rest });
  }
  if (remaining > 0) return { ok: false };
  return { ok: true, lots: updated, totalCost, avgCost: qty > 0 ? totalCost / qty : 0, consumedFrom };
}

// Restitue une consommation FIFO exactement sur les lots d'origine (par id) —
// s'ils existent encore, on ajoute la quantité (plafonnée à leur capacité de
// départ) ; s'ils ont été entièrement consommés et donc retirés du tableau,
// on les recrée avec la quantité rendue. Ainsi un lot ne reste jamais bloqué
// après suppression d'une vente ou d'une ouverture qui l'avait consommé.
function restoreToLots(currentLots, consumedFrom) {
  let lots = [...(currentLots || [])];
  (consumedFrom || []).forEach((c) => {
    const idx = lots.findIndex((l) => l.id === c.id);
    if (idx >= 0) {
      lots[idx] = { ...lots[idx], qty: Math.min(lots[idx].originalQty, lots[idx].qty + c.qtyTaken) };
    } else {
      lots.push({ id: c.id, date: c.date, originalQty: c.originalQty, unitCost: c.unitCost, lotNo: c.lotNo, qty: Math.min(c.originalQty, c.qtyTaken) });
    }
  });
  return lots;
}

function defaultData() {
  const startDate = START_DATE;
  const lots = {};
  const lotSeqByProduct = {};
  Object.entries(INITIAL_STOCK).forEach(([brand, qtys]) => {
    qtys.forEach((q, idx) => {
      const id = `${brand}-${idx}`;
      const product = CATALOG.filter((c) => c.brand === brand)[idx];
      if (q > 0) lotSeqByProduct[id] = 1;
      lots[id] = {
        gros: q > 0 ? [{ id: uid(), date: startDate, qty: q, originalQty: q, unitCost: product.purchase, lotNo: 1 }] : [],
        detail: [],
      };
    });
  });
  return {
    meta: { initialCash: 0, startingCapital: 1000000, startDate, createdAt: new Date().toISOString(), lotSeqByProduct },
    products: buildDefaultProducts(),
    lots,
    sales: [],
    detailSales: [],
    restocks: [],
    openings: [],
    loans: [
      {
        id: uid(),
        date: startDate,
        beneficiary: "Partenaire (investisseur)",
        amount: 175000,
        repayments: [],
        isOpening: true,
        note: "Prêt déjà en cours au 10/06/2026, intégré par défaut",
      },
    ],
    liabilities: [],
    withdrawals: [],
    personalNotes: [],
    expenses: [],
    recyclingCollections: [],
    recyclingSales: [],
  };
}

// Migration : les anciennes sauvegardes utilisaient un compteur simple
// (data.stock = {gros, detail}) au lieu de lots FIFO datés et numérotés.
function migrate(d) {
  if (!d.withdrawals) d = { ...d, withdrawals: [] };
  if (!d.personalNotes) d = { ...d, personalNotes: [] };
  if (!d.expenses) d = { ...d, expenses: [] };
  if (!d.recyclingCollections) d = { ...d, recyclingCollections: [] };
  if (!d.recyclingSales) d = { ...d, recyclingSales: [] };
  if (d.sales && d.sales.some((s) => !s.payments)) {
    d = {
      ...d,
      sales: d.sales.map((s) =>
        s.payments ? s : { ...s, payments: s.paidAmount > 0 ? [{ id: uid(), date: s.date, amount: s.paidAmount }] : [] }
      ),
    };
  }
  if (d.detailSales && d.detailSales.some((s) => !s.payments)) {
    d = {
      ...d,
      detailSales: d.detailSales.map((s) =>
        s.payments ? s : { ...s, payments: s.paidAmount > 0 ? [{ id: uid(), date: s.date, amount: s.paidAmount }] : [] }
      ),
    };
  }
  if (d.loans && d.loans.some((l) => !l.repayments)) {
    d = {
      ...d,
      loans: d.loans.map((l) =>
        l.repayments
          ? l
          : {
              ...l,
              repayments: l.repaid > 0 ? [{ id: uid(), date: l.date, amount: l.repaid }] : [],
            }
      ),
    };
  }
  if (d.lots) {
    const maxNoByProduct = {};
    let touched = false;
    Object.entries(d.lots).forEach(([productId, row]) => {
      let maxNo = 0;
      [...(row.gros || []), ...(row.detail || [])].forEach((l) => {
        if (typeof l.lotNo !== "number") {
          maxNo += 1;
          l.lotNo = maxNo;
          touched = true;
        } else maxNo = Math.max(maxNo, l.lotNo);
        if (typeof l.originalQty !== "number") {
          l.originalQty = l.qty; // meilleure estimation possible pour un lot déjà existant
          touched = true;
        }
      });
      maxNoByProduct[productId] = maxNo;
    });
    if (touched || !d.meta.lotSeqByProduct) {
      // Migration depuis l'ancienne numérotation globale (meta.lotSeq) — on
      // reconstruit un compteur propre à chaque produit à partir des
      // numéros de lot réellement présents sur ses propres lots.
      const merged = { ...(d.meta.lotSeqByProduct || {}) };
      Object.entries(maxNoByProduct).forEach(([pid, maxNo]) => {
        merged[pid] = Math.max(maxNo, merged[pid] || 0);
      });
      d = { ...d, meta: { ...d.meta, lotSeqByProduct: merged } };
    }
    return fixStartDate(d);
  }
  const lots = {};
  const lotSeqByProduct = {};
  d.products.forEach((p) => {
    const row = (d.stock && d.stock[p.id]) || { gros: 0, detail: 0 };
    let seq = 0;
    const grosLotNo = row.gros > 0 ? ++seq : null;
    const detailLotNo = row.detail > 0 ? ++seq : null;
    if (seq > 0) lotSeqByProduct[p.id] = seq;
    lots[p.id] = {
      gros: row.gros > 0 ? [{ id: uid(), date: d.meta.startDate, qty: row.gros, originalQty: row.gros, unitCost: p.purchase, lotNo: grosLotNo }] : [],
      detail: row.detail > 0 ? [{ id: uid(), date: d.meta.startDate, qty: row.detail, originalQty: row.detail, unitCost: p.purchase / p.units, lotNo: detailLotNo }] : [],
    };
  });
  const { stock, ...rest } = d;
  return fixStartDate({ ...rest, lots, meta: { ...rest.meta, lotSeqByProduct } });
}

// Si le suivi n'a pas encore commencé (aucune vente/réappro/ouverture), on
// peut sans risque aligner la date de départ sur START_DATE si elle diverge
// (ex. ancienne sauvegarde créée avant que cette date soit figée).
function fixStartDate(d) {
  const untouched = d.sales.length === 0 && d.detailSales.length === 0 && d.restocks.length === 0 && d.openings.length === 0;
  if (!untouched || d.meta.startDate === START_DATE) return d;
  const lots = {};
  Object.entries(d.lots).forEach(([id, row]) => {
    lots[id] = {
      gros: (row.gros || []).map((l) => ({ ...l, date: START_DATE })),
      detail: (row.detail || []).map((l) => ({ ...l, date: START_DATE })),
    };
  });
  return { ...d, meta: { ...d.meta, startDate: START_DATE }, lots };
}

const fcfa = (n) =>
  Math.round(n || 0).toLocaleString("fr-FR").replace(/\u202f/g, " ") + " F";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------------------------------------------------------------------- */

export default function App({ uid: currentUid, onSignOut }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [toast, setToast] = useState(null);
  const pendingRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const remote = await loadData(currentUid);
        if (remote) {
          setData(migrate(remote));
        } else {
          const d = defaultData();
          setData(d);
          await saveData(currentUid, d);
        }
      } catch (e) {
        const d = defaultData();
        setData(d);
        try {
          await saveData(currentUid, d);
        } catch (_) {}
      }
    })();
  }, [currentUid]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Tente d'enregistrer, avec plusieurs essais automatiques (délais
  // croissants) avant d'abandonner. Ceci absorbe les échecs transitoires du
  // stockage (réseau, limite de fréquence) sans jamais perdre les données :
  // tant que l'enregistrement n'a pas réussi, elles restent en mémoire et un
  // bandeau invite à réessayer manuellement.
  const saveWithRetry = useCallback(async (payload, attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      try {
        await saveData(currentUid, payload);
        return true;
      } catch (e) {
        if (i < attempts - 1) await sleep(500 * (i + 1) * (i + 1));
      }
    }
    return false;
  }, [currentUid]);

  const persist = useCallback(
    async (next) => {
      setData(next);
      pendingRef.current = next;
      setSaving(true);
      const ok = await saveWithRetry(next);
      setSaving(false);
      if (ok) {
        pendingRef.current = null;
        setSaveError(false);
      } else {
        setSaveError(true);
      }
    },
    [saveWithRetry]
  );

  const retrySave = useCallback(async () => {
    const payload = pendingRef.current || data;
    if (!payload) return;
    setSaving(true);
    const ok = await saveWithRetry(payload);
    setSaving(false);
    if (ok) {
      pendingRef.current = null;
      setSaveError(false);
      showToast("Enregistré avec succès");
    } else {
      setSaveError(true);
    }
  }, [data, saveWithRetry]);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  };

  // Tant qu'un enregistrement est en échec, on retente automatiquement en
  // arrière-plan (pas besoin de rester appuyer sur "Réessayer") jusqu'à ce
  // que ça passe.
  useEffect(() => {
    if (!saveError) return;
    const id = setInterval(() => {
      retrySave();
    }, 8000);
    return () => clearInterval(id);
  }, [saveError, retrySave]);

  const productsById = useMemo(
    () => (data ? Object.fromEntries(data.products.map((p) => [p.id, p])) : {}),
    [data]
  );
  const totals = useMemo(() => (data ? computeTotals(data) : null), [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Droplet className="animate-pulse text-teal-600" size={32} />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  /* ------------------------------ Actions ------------------------------ */

  const addSale = (sale) => {
    const grosLots = data.lots[sale.productId]?.gros || [];
    if (sale.qty > lotsQty(grosLots)) {
      showToast(`Stock gros insuffisant (${lotsQty(grosLots)} dispo)`, "error");
      return false;
    }
    const res = consumeFifo(grosLots, sale.qty);
    const total = sale.qty * sale.unitPrice;
    const record = {
      id: uid(),
      date: sale.date,
      client: sale.client || "Client comptoir",
      productId: sale.productId,
      qty: sale.qty,
      unitPrice: sale.unitPrice,
      unitCost: res.avgCost,
      mode: sale.mode,
      paidAmount: sale.mode === "cash" ? total : 0,
      payments: sale.mode === "cash" ? [{ id: uid(), date: sale.date, amount: total }] : [],
      consumedFrom: res.consumedFrom,
    };
    const next = {
      ...data,
      sales: [record, ...data.sales],
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], gros: res.lots } },
    };
    persist(next);
    showToast("Vente enregistrée");
    return true;
  };

  // Rattrapage : traite plusieurs ventes historiques d'un coup, dans l'ordre
  // chronologique, sur une seule copie de travail (évite que des appels
  // successifs à addSale s'écrasent les uns les autres avant le re-rendu).
  const addBatchSales = (rows) => {
    let working = data;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const failed = [];
    sorted.forEach((sale) => {
      const grosLots = working.lots[sale.productId]?.gros || [];
      if (sale.qty > lotsQty(grosLots)) {
        failed.push(sale);
        return;
      }
      const res = consumeFifo(grosLots, sale.qty);
      const total = sale.qty * sale.unitPrice;
      const record = {
        id: uid(),
        date: sale.date,
        client: sale.client || "Client comptoir",
        productId: sale.productId,
        qty: sale.qty,
        unitPrice: sale.unitPrice,
        unitCost: res.avgCost,
        mode: sale.mode,
        paidAmount: sale.mode === "cash" ? total : 0,
        payments: sale.mode === "cash" ? [{ id: uid(), date: sale.date, amount: total }] : [],
        consumedFrom: res.consumedFrom,
      };
      working = {
        ...working,
        sales: [record, ...working.sales],
        lots: { ...working.lots, [sale.productId]: { ...working.lots[sale.productId], gros: res.lots } },
      };
    });
    persist(working);
    const okCount = sorted.length - failed.length;
    if (failed.length > 0) {
      showToast(`${okCount} vente(s) importée(s), ${failed.length} refusée(s) (stock insuffisant)`, "error");
    } else {
      showToast(`${okCount} vente(s) importée(s)`);
    }
    return failed;
  };

  const openPack = (productId, date) => {
    const p = productsById[productId];
    const grosLots = data.lots[productId]?.gros || [];
    if (lotsQty(grosLots) < 1) {
      showToast("Aucun colis disponible à ouvrir", "error");
      return;
    }
    const sourceLotId = sortLots(grosLots)[0].id;
    const res = consumeFifo(grosLots, 1);
    const detailLots = data.lots[productId]?.detail || [];
    const lotNo = nextLotNo(data.meta, productId);
    const newDetailLot = {
      id: uid(),
      date: date || todayISO(),
      qty: p.units,
      originalQty: p.units,
      unitCost: res.avgCost / p.units,
      lotNo,
    };
    const openingDate = date || todayISO();
    const next = {
      ...data,
      meta: bumpLotSeq(data.meta, productId, lotNo),
      lots: {
        ...data.lots,
        [productId]: { gros: res.lots, detail: [...detailLots, newDetailLot] },
      },
      openings: [
        { id: uid(), date: openingDate, productId, qty: 1, lotId: newDetailLot.id, sourceLotId, consumedFrom: res.consumedFrom },
        ...data.openings,
      ],
    };
    persist(next);
    showToast(`Colis ouvert : +${p.units} unités en détail`);
  };

  const addDetailSale = (sale) => {
    const detailLots = data.lots[sale.productId]?.detail || [];
    if (sale.qty > lotsQty(detailLots)) {
      showToast(`Stock détail insuffisant (${lotsQty(detailLots)} dispo)`, "error");
      return false;
    }
    const res = consumeFifo(detailLots, sale.qty);
    const total = sale.qty * sale.unitPrice;
    const record = {
      id: uid(),
      date: sale.date,
      client: sale.client || "Client comptoir",
      productId: sale.productId,
      qty: sale.qty,
      unitPrice: sale.unitPrice,
      unitCost: res.avgCost,
      mode: sale.mode,
      paidAmount: sale.mode === "cash" ? total : 0,
      payments: sale.mode === "cash" ? [{ id: uid(), date: sale.date, amount: total }] : [],
      consumedFrom: res.consumedFrom,
    };
    const next = {
      ...data,
      detailSales: [record, ...data.detailSales],
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], detail: res.lots } },
    };
    persist(next);
    showToast("Vente au détail enregistrée");
    return true;
  };

  const addRestock = (r) => {
    const grosLots = data.lots[r.productId]?.gros || [];
    const lotNo = nextLotNo(data.meta, r.productId);
    const newLot = { id: uid(), date: r.date, qty: r.qty, originalQty: r.qty, unitCost: r.unitCost, lotNo };
    const record = { id: uid(), date: r.date, productId: r.productId, qty: r.qty, unitCost: r.unitCost, lotId: newLot.id };
    let products = data.products;
    if (r.updateReference) {
      products = products.map((p) => (p.id === r.productId ? { ...p, purchase: r.unitCost } : p));
    }
    const next = {
      ...data,
      meta: bumpLotSeq(data.meta, r.productId, lotNo),
      products,
      restocks: [record, ...data.restocks],
      lots: { ...data.lots, [r.productId]: { ...data.lots[r.productId], gros: [...grosLots, newLot] } },
    };
    persist(next);
    showToast("Réapprovisionnement enregistré");
  };

  // --- Suppressions (corrections d'erreurs de saisie) ---

  // Une vente supprimée restitue la quantité au stock gros, sous forme d'un
  // nouveau lot daté au jour de la vente d'origine, au coût qui avait été
  // consommé (annule proprement l'effet sur trésorerie/stock/statistiques).
  const deleteSale = (id) => {
    const sale = data.sales.find((s) => s.id === id);
    if (!sale) return;
    const grosLots = data.lots[sale.productId]?.gros || [];
    let updatedGros;
    let meta = data.meta;
    if (sale.consumedFrom) {
      // Ventes récentes : on sait exactement de quel(s) lot(s) ça vient — on
      // restitue dessus, quitte à les recréer s'ils avaient été épuisés.
      updatedGros = restoreToLots(grosLots, sale.consumedFrom);
    } else {
      // Anciennes ventes (avant ce correctif) : pas d'historique de
      // consommation précis, on retombe sur l'ancien comportement (un
      // nouveau lot séparé) plutôt que de deviner.
      const lotNo = nextLotNo(meta, sale.productId);
      meta = bumpLotSeq(meta, sale.productId, lotNo);
      updatedGros = [...grosLots, { id: uid(), date: sale.date, qty: sale.qty, originalQty: sale.qty, unitCost: sale.unitCost, lotNo }];
    }
    persist({
      ...data,
      meta,
      sales: data.sales.filter((s) => s.id !== id),
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], gros: updatedGros } },
    });
    showToast("Vente supprimée, stock restitué");
  };

  // Repasse un colis détail en gros s'il est redevenu parfaitement intact
  // (plus aucune unité vendue dessus) — utilisé à la fois pour l'annulation
  // manuelle d'une ouverture et pour la bascule automatique quand supprimer
  // une vente rend un lot de nouveau complet. Ne fait rien (renvoie les
  // données inchangées) si le lot n'existe plus ou n'est pas intact.
  const revertOpeningIfIntact = (d, openingId) => {
    const o = d.openings.find((x) => x.id === openingId);
    if (!o) return d;
    const detailLots = d.lots[o.productId]?.detail || [];
    const lot = detailLots.find((l) => l.id === o.lotId);
    if (!lot || lot.qty !== lot.originalQty) return d;
    const p = productsById[o.productId];
    const grosLots = d.lots[o.productId]?.gros || [];
    let updatedGros;
    let meta = d.meta;
    if (o.consumedFrom) {
      updatedGros = restoreToLots(grosLots, o.consumedFrom);
    } else {
      const lotNo = nextLotNo(meta, o.productId);
      meta = bumpLotSeq(meta, o.productId, lotNo);
      updatedGros = [...grosLots, { id: uid(), date: o.date, qty: 1, originalQty: 1, unitCost: lot.unitCost * p.units, lotNo }];
    }
    // Le colis redevient exactement comme s'il n'avait jamais été ouvert —
    // si son numéro était le dernier attribué à ce produit, on le rend pour
    // que la prochaine ouverture le reprenne, au lieu de sauter un cran.
    meta = releaseLotNoIfLast(meta, o.productId, lot.lotNo);
    return {
      ...d,
      meta,
      openings: d.openings.filter((x) => x.id !== openingId),
      lots: { ...d.lots, [o.productId]: { gros: updatedGros, detail: detailLots.filter((l) => l.id !== o.lotId) } },
    };
  };

  // Nettoyage : fusionne les "lots fantômes" créés par l'ancien bug de
  // restitution (avant correctif) — des mini-lots détail isolés, sans
  // aucune ouverture correspondante dans l'historique, apparus quand une
  // vente supprimée créait un nouveau lot séparé au lieu de réparer
  // l'original. Un lot orphelin (sans ouverture liée) n'est jamais un
  // "nouveau colis" — c'est un morceau du même colis d'origine, mal
  // restitué par l'ancien bug. On ne compte donc sa capacité qu'une seule
  // fois (celle du lot réellement ouvert), pas en plus : le résultat
  // retrouve exactement le vrai compte (ex : 0 vendue / 6, pas 2 vendues / 8).
  const mergeOrphanDetailLots = (productId) => {
    const detailLots = data.lots[productId]?.detail || [];
    if (detailLots.length <= 1) {
      showToast("Rien à fusionner pour cet article");
      return;
    }
    const sorted = sortLots(detailLots);
    const first = sorted[0];
    const anchoredIds = new Set(data.openings.filter((o) => o.productId === productId).map((o) => o.lotId));
    const anchored = sorted.filter((l) => anchoredIds.has(l.id));
    const base = anchored.length > 0 ? anchored : sorted; // repli si aucun lot n'a d'ouverture liée
    const totalQty = sorted.reduce((s, l) => s + l.qty, 0);
    const totalOriginal = base.reduce((s, l) => s + l.originalQty, 0);
    const weightedCost = sorted.reduce((s, l) => s + l.qty * l.unitCost, 0) / (totalQty || 1);
    const merged = {
      id: first.id,
      date: first.date,
      lotNo: first.lotNo,
      qty: Math.min(totalQty, totalOriginal),
      originalQty: totalOriginal,
      unitCost: weightedCost,
    };
    // Les ouvertures qui pointaient sur les lots absorbés doivent maintenant
    // pointer sur le lot fusionné, sinon elles deviendraient orphelines.
    const absorbedIds = sorted.slice(1).map((l) => l.id);
    persist({
      ...data,
      openings: data.openings.map((o) => (absorbedIds.includes(o.lotId) ? { ...o, lotId: merged.id } : o)),
      lots: { ...data.lots, [productId]: { ...data.lots[productId], detail: [merged] } },
    });
    showToast("Lots fusionnés en un seul");
  };

  const deleteDetailSale = (id) => {
    const sale = data.detailSales.find((s) => s.id === id);
    if (!sale) return;
    const detailLots = data.lots[sale.productId]?.detail || [];
    let updatedDetail;
    let meta = data.meta;
    if (sale.consumedFrom) {
      updatedDetail = restoreToLots(detailLots, sale.consumedFrom);
    } else {
      const lotNo = nextLotNo(meta, sale.productId);
      meta = bumpLotSeq(meta, sale.productId, lotNo);
      updatedDetail = [...detailLots, { id: uid(), date: sale.date, qty: sale.qty, originalQty: sale.qty, unitCost: sale.unitCost, lotNo }];
    }
    let next = {
      ...data,
      meta,
      detailSales: data.detailSales.filter((s) => s.id !== id),
      lots: { ...data.lots, [sale.productId]: { ...data.lots[sale.productId], detail: updatedDetail } },
    };
    // Si ça rend un colis ouvert de nouveau intact (ex : bouteille reprise
    // au client, vente annulée), on le repasse automatiquement en gros —
    // exactement comme si ce colis n'avait jamais été ouvert.
    let autoReverted = false;
    (sale.consumedFrom || []).forEach((c) => {
      const opening = next.openings.find((o) => o.lotId === c.id);
      if (opening) {
        const before = next;
        next = revertOpeningIfIntact(next, opening.id);
        if (next !== before) autoReverted = true;
      }
    });
    persist(next);
    showToast(autoReverted ? "Vente supprimée — colis de nouveau intact, restitué automatiquement en gros" : "Vente au détail supprimée, stock restitué");
  };

  // Un réappro n'est supprimable que si le lot qu'il a créé est encore
  // intact (rien vendu dessus) — sinon ça corromprait le coût déjà
  // appliqué à des ventes passées.
  const deleteRestock = (id) => {
    const r = data.restocks.find((x) => x.id === id);
    if (!r) return;
    const grosLots = data.lots[r.productId]?.gros || [];
    const lot = grosLots.find((l) => l.id === r.lotId);
    if (!lot || lot.qty !== lot.originalQty) {
      showToast("Impossible : ce lot a déjà été partiellement vendu", "error");
      return;
    }
    persist({
      ...data,
      meta: releaseLotNoIfLast(data.meta, r.productId, lot.lotNo),
      restocks: data.restocks.filter((x) => x.id !== id),
      lots: { ...data.lots, [r.productId]: { ...data.lots[r.productId], gros: grosLots.filter((l) => l.id !== r.lotId) } },
    });
    showToast("Réapprovisionnement supprimé");
  };

  // Une ouverture de colis n'est annulable que si aucune des bouteilles
  // qu'elle a créées n'a encore été vendue au détail.
  const deleteOpening = (id) => {
    const o = data.openings.find((x) => x.id === id);
    if (!o) return;
    const detailLots = data.lots[o.productId]?.detail || [];
    const lot = detailLots.find((l) => l.id === o.lotId);
    if (!lot || lot.qty !== lot.originalQty) {
      showToast("Impossible : des unités de ce colis ont déjà été vendues", "error");
      return;
    }
    persist(revertOpeningIfIntact(data, id));
    showToast("Ouverture annulée, colis restitué en gros");
  };

  // Débouclage manuel pour les ouvertures restées bloquées (à cause de
  // l'ancien bug, ou simplement parce que des unités ont réellement été
  // vendues) : on arrête juste le SUIVI de cette ouverture — elle disparaît
  // de "colis ouverts en cours". On ne touche JAMAIS aux bouteilles : elles
  // restent en stock détail, normalement vendables, rien n'est perdu. On ne
  // "rend" rien en gros non plus, puisqu'on ne peut pas reconstituer un
  // colis complet à partir de bouteilles déjà entamées — ce serait inventer
  // une quantité qui n'existe plus.
  const forceCloseOpening = (id) => {
    const o = data.openings.find((x) => x.id === id);
    if (!o) return;
    persist({ ...data, openings: data.openings.filter((x) => x.id !== id) });
    showToast("Suivi arrêté — les bouteilles restantes restent en stock détail, normalement vendables.");
  };

  const deleteLoan = (id) => {
    persist({ ...data, loans: data.loans.filter((l) => l.id !== id) });
    showToast("Prêt supprimé");
  };

  const recordPayment = (kind, id, amount, date) => {
    const list = kind === "sales" ? data.sales : data.detailSales;
    const next = {
      ...data,
      [kind]: list.map((s) => {
        if (s.id !== id) return s;
        const paidAmount = Math.min(s.qty * s.unitPrice, s.paidAmount + amount);
        const payments = [...(s.payments || []), { id: uid(), date: date || todayISO(), amount }];
        return { ...s, paidAmount, payments };
      }),
    };
    persist(next);
    showToast("Paiement enregistré");
  };

  // Annule un versement précis — recalcule le montant payé à partir de
  // l'historique restant. Si c'était le seul versement, la créance redevient
  // entièrement due, exactement comme avant l'encaissement.
  const deletePayment = (kind, id, paymentId) => {
    const list = kind === "sales" ? data.sales : data.detailSales;
    const next = {
      ...data,
      [kind]: list.map((s) => {
        if (s.id !== id) return s;
        const payments = (s.payments || []).filter((p) => p.id !== paymentId);
        const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        return { ...s, paidAmount, payments };
      }),
    };
    persist(next);
    showToast("Versement annulé — créance rouverte");
  };

  // Rouvre entièrement une créance soldée (efface tous les versements d'un
  // coup) — pour les cas où l'encaissement a été enregistré par erreur.
  const resetPayments = (kind, id) => {
    const list = kind === "sales" ? data.sales : data.detailSales;
    const next = {
      ...data,
      [kind]: list.map((s) => (s.id === id ? { ...s, paidAmount: 0, payments: [] } : s)),
    };
    persist(next);
    showToast("Créance rouverte — dette rétablie");
  };

  const addLoan = (loan) => {
    const next = { ...data, loans: [{ id: uid(), repayments: [], ...loan }, ...data.loans] };
    persist(next);
    showToast("Prêt enregistré");
  };

  const repayLoan = (id, amount, date) => {
    const loan = data.loans.find((l) => l.id === id);
    if (!loan) return;
    const remaining = loan.amount - repaidAmount(loan);
    const capped = Math.max(0, Math.min(amount, remaining));
    if (capped <= 0) return;
    const record = { id: uid(), date: date || todayISO(), amount: capped };
    const next = {
      ...data,
      loans: data.loans.map((l) => (l.id === id ? { ...l, repayments: [record, ...(l.repayments || [])] } : l)),
    };
    persist(next);
    showToast("Remboursement enregistré");
  };

  const deleteRepayment = (loanId, repaymentId) => {
    const next = {
      ...data,
      loans: data.loans.map((l) =>
        l.id === loanId ? { ...l, repayments: (l.repayments || []).filter((r) => r.id !== repaymentId) } : l
      ),
    };
    persist(next);
    showToast("Remboursement supprimé");
  };

  const addLiability = (l) => {
    const next = { ...data, liabilities: [{ id: uid(), ...l }, ...data.liabilities] };
    persist(next);
    showToast("Passif ajouté");
  };

  const removeLiability = (id) => {
    persist({ ...data, liabilities: data.liabilities.filter((l) => l.id !== id) });
  };

  // Rémunération du gérant : un retrait de trésorerie distinct du capital
  // de l'actionnaire, pour que le "Résultat net" affiché reste bien celui
  // qui revient à l'actionnaire, une fois la gestion payée.
  const addWithdrawal = (w) => {
    const next = { ...data, withdrawals: [{ id: uid(), ...w }, ...data.withdrawals] };
    persist(next);
    showToast("Rémunération enregistrée");
  };

  const deleteWithdrawal = (id) => {
    persist({ ...data, withdrawals: data.withdrawals.filter((w) => w.id !== id) });
    showToast("Rémunération supprimée");
  };

  // Notes personnelles hors bilan : purement informatif, n'affecte jamais
  // les totaux du business (ex : montant dû personnellement à un tiers,
  // sans lien avec l'activité de l'eau).
  const addPersonalNote = (n) => {
    const next = { ...data, personalNotes: [{ id: uid(), ...n }, ...data.personalNotes] };
    persist(next);
    showToast("Note ajoutée");
  };

  const deletePersonalNote = (id) => {
    persist({ ...data, personalNotes: data.personalNotes.filter((n) => n.id !== id) });
  };

  // Dépenses de l'entreprise : une charge payée immédiatement sort de la
  // trésorerie tout de suite (ce n'est PAS un passif — un passif, c'est une
  // dette qu'on doit encore payer). Si une dépense n'est pas encore payée,
  // c'est là qu'un vrai passif entre en jeu (onglet Bilan).
  const addExpense = (e) => {
    const next = { ...data, expenses: [{ id: uid(), ...e }, ...data.expenses] };
    persist(next);
    showToast("Dépense enregistrée");
  };

  const deleteExpense = (id) => {
    persist({ ...data, expenses: data.expenses.filter((e) => e.id !== id) });
    showToast("Dépense supprimée");
  };

  // Recyclage : collecte de bouteilles vides chez les clients — gratuite la
  // plupart du temps, mais parfois rachetée. Si un prix est indiqué, ça
  // génère automatiquement une dépense liée (catégorie dédiée), pour que la
  // trésorerie et les rapports en tiennent compte comme n'importe quelle
  // autre dépense de l'entreprise.
  const addRecyclingCollection = (c) => {
    const unitCost = Number(c.unitCost) || 0;
    let expenses = data.expenses;
    let expenseId = null;
    if (unitCost > 0) {
      expenseId = uid();
      const p = data.products.find((x) => x.id === c.productId);
      const capLabel = p ? (capacityOf(p) ? `${capacityOf(p)}L` : p.format) : "";
      expenses = [
        {
          id: expenseId,
          date: c.date,
          category: "Recyclage (rachat de bouteilles)",
          label: `${c.quantity} bouteille(s) ${p ? p.brand + " " + capLabel : ""}${c.client ? " — " + c.client : ""}`.trim(),
          amount: c.quantity * unitCost,
        },
        ...expenses,
      ];
    }
    const next = {
      ...data,
      recyclingCollections: [{ id: uid(), ...c, unitCost, expenseId }, ...data.recyclingCollections],
      expenses,
    };
    persist(next);
    showToast(unitCost > 0 ? "Collecte enregistrée (dépense créée)" : "Collecte enregistrée");
  };

  const deleteRecyclingCollection = (id) => {
    const col = data.recyclingCollections.find((c) => c.id === id);
    persist({
      ...data,
      recyclingCollections: data.recyclingCollections.filter((c) => c.id !== id),
      expenses: col && col.expenseId ? data.expenses.filter((e) => e.id !== col.expenseId) : data.expenses,
    });
    showToast("Collecte supprimée");
  };

  const addRecyclingSale = (s) => {
    const soldProduct = data.products.find((p) => p.id === s.productId);
    const key = soldProduct ? capacityKey(soldProduct) : null;
    const sameBucket = (pid) => {
      const p = data.products.find((x) => x.id === pid);
      return p && key && capacityKey(p) === key;
    };
    const available =
      data.recyclingCollections.filter((c) => sameBucket(c.productId)).reduce((sum, c) => sum + c.quantity, 0) -
      data.recyclingSales.filter((x) => sameBucket(x.productId)).reduce((sum, x) => sum + x.quantity, 0);
    if (s.quantity > available) {
      showToast(`Stock de bouteilles insuffisant pour cette contenance (${available} disponibles)`, "error");
      return false;
    }
    const next = { ...data, recyclingSales: [{ id: uid(), ...s }, ...data.recyclingSales] };
    persist(next);
    showToast("Vente de recyclage enregistrée");
    return true;
  };

  const deleteRecyclingSale = (id) => {
    persist({ ...data, recyclingSales: data.recyclingSales.filter((s) => s.id !== id) });
    showToast("Vente de recyclage supprimée");
  };

  const updateProduct = (id, patch) => {
    persist({ ...data, products: data.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };

  // Réglage manuel du compteur de lots d'un produit — utile pour corriger
  // une numérotation qui a "sauté" (ex : après avoir annulé plusieurs
  // ouvertures/ventes de suite). La valeur saisie est le DERNIER numéro
  // utilisé ; le prochain lot de ce produit prendra valeur+1.
  const setLotSeq = (productId, value) => {
    persist({ ...data, meta: bumpLotSeq(data.meta, productId, Number(value) || 0) });
    showToast("Compteur de lots mis à jour");
  };

  // Suppression manuelle d'un lot depuis le registre complet — même sécurité
  // que partout ailleurs (uniquement si rien n'a encore été vendu dessus).
  // Nettoie aussi tout réappro/ouverture qui pointerait dessus (normalement
  // aucun pour un vrai lot fantôme), et rend son numéro s'il était le dernier.
  const deleteLotManually = (productId, kind, lotId) => {
    const lots = data.lots[productId]?.[kind] || [];
    const lot = lots.find((l) => l.id === lotId);
    if (!lot || lot.qty !== lot.originalQty) {
      showToast("Impossible : ce lot a déjà été partiellement vendu", "error");
      return;
    }
    persist({
      ...data,
      meta: releaseLotNoIfLast(data.meta, productId, lot.lotNo),
      restocks: data.restocks.filter((r) => r.lotId !== lotId),
      openings: data.openings.filter((o) => o.lotId !== lotId),
      lots: { ...data.lots, [productId]: { ...data.lots[productId], [kind]: lots.filter((l) => l.id !== lotId) } },
    });
    showToast("Lot supprimé");
  };

  // Nouvelle marque ou nouveau format ajouté manuellement — démarre avec un
  // stock vide (à réapprovisionner ensuite normalement).
  const addProduct = (p) => {
    const id = `custom-${uid()}`;
    const product = {
      id,
      brand: p.brand.trim().toUpperCase(),
      format: p.format.trim(),
      units: Number(p.units),
      purchase: Number(p.purchase),
      sellPrice: Number(p.sellPrice),
      retailPrice: Number(p.retailPrice),
    };
    const next = {
      ...data,
      products: [...data.products, product],
      lots: { ...data.lots, [id]: { gros: [], detail: [] } },
    };
    persist(next);
    showToast("Article ajouté au catalogue");
  };

  const setInitialCash = (v) => persist({ ...data, meta: { ...data.meta, initialCash: v } });
  const setStartingCapital = (v) => persist({ ...data, meta: { ...data.meta, startingCapital: v } });

  const markExported = () => persist({ ...data, meta: { ...data.meta, lastExportAt: new Date().toISOString() } });

  // Restauration d'une sauvegarde JSON exportée précédemment — filet de
  // sécurité si le stockage venait à ne pas persister entre deux versions.
  const restoreData = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.products || !parsed.lots) {
        showToast("Fichier invalide — ce n'est pas une sauvegarde reconnue", "error");
        return false;
      }
      persist(migrate(parsed));
      showToast("Sauvegarde restaurée avec succès");
      return true;
    } catch (e) {
      showToast("Fichier illisible", "error");
      return false;
    }
  };

  /* --------------------------- Calculs dérivés --------------------------- */

  const NAV = [
    { key: "dashboard", label: "Accueil", icon: LayoutDashboard },
    { key: "sales", label: "Ventes", icon: ShoppingCart },
    { key: "detail", label: "Détail", icon: Scissors },
    { key: "clients", label: "Clients", icon: Users },
    { key: "loans", label: "Prêts", icon: HandCoins },
    { key: "stock", label: "Stock", icon: Boxes },
    { key: "expenses", label: "Dépenses", icon: Receipt },
    { key: "recycling", label: "Recyclage", icon: Recycle },
    { key: "balance", label: "Bilan", icon: PiggyBank },
    { key: "settings", label: "Produits", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-teal-50 text-slate-800 pb-28 font-sans">
      <style>{`
        @media print {
          .no-print, header, nav, input, select, button, textarea { display: none !important; }
          body { background: white !important; }
          /* Impression ciblée : quand une seule sous-rubrique est choisie
             (bouton "Imprimer" d'une carte précise), on masque TOUT le
             contenu de l'onglet (y compris les formulaires et cartes non
             encadrées) et on ne garde que la section ciblée. */
          body[data-print-only] main > div > * { display: none !important; }
          body[data-print-only] main > div > .print-target-active { display: block !important; }
        }
        /* Les boutons natifs "effacer" et "incrémenter" de Chrome/Edge sur les
           champs date ont une zone cliquable qui peut déborder légèrement sur
           le bouton "jour suivant" juste à côté, sur ordinateur. On les
           désactive : le bouton "calendrier" natif reste utilisable. */
        input[type="date"]::-webkit-clear-button,
        input[type="date"]::-webkit-inner-spin-button {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <header className="no-print sticky top-0 z-20 bg-teal-800 text-white px-4 py-3 flex items-center gap-2 shadow-sm">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0">
          <Droplet size={18} className="text-blue-700" fill="currentColor" fillOpacity={0.15} />
        </span>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-sm">Multivers'Eau — Suivi</div>
          <div className="text-xs text-cyan-100">
            Depuis le {new Date(data.meta.startDate).toLocaleDateString("fr-FR", { timeZone: "UTC" })}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-cyan-100 uppercase tracking-wide">Trésorerie</div>
          <div className="font-mono font-bold text-sm tabular-nums">{fcfa(totals.treasury)}</div>
        </div>
        {onSignOut && (
          <button onClick={onSignOut} className="no-print ml-2 text-cyan-100 text-xs underline shrink-0">
            Déconnexion
          </button>
        )}
      </header>

      {saveError && (
        <div className="no-print bg-rose-600 text-white px-4 py-2 flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            Dernières modifications pas encore enregistrées.
          </span>
          <button onClick={retrySave} disabled={saving} className="bg-white text-rose-600 font-semibold px-2.5 py-1 rounded-md shrink-0">
            {saving ? "…" : "Réessayer"}
          </button>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-3 pt-3">
        {tab === "dashboard" && <Dashboard data={data} totals={totals} productsById={productsById} />}
        {tab === "sales" && (
          <SalesTab data={data} productsById={productsById} onAdd={addSale} onBatchAdd={addBatchSales} onPay={(id, a) => recordPayment("sales", id, a)} onDelete={deleteSale} />
        )}
        {tab === "detail" && (
          <DetailTab data={data} totals={totals} productsById={productsById} onOpen={openPack} onSell={addDetailSale} onPay={(id, a) => recordPayment("detailSales", id, a)} onDeleteSale={deleteDetailSale} onDeleteOpening={deleteOpening} onForceCloseOpening={forceCloseOpening} onMergeLots={mergeOrphanDetailLots} />
        )}
        {tab === "clients" && (
          <ClientsTab
            data={data}
            totals={totals}
            onPaySale={(id, a, d) => recordPayment("sales", id, a, d)}
            onPayDetail={(id, a, d) => recordPayment("detailSales", id, a, d)}
            onDeletePayment={(kind, id, paymentId) => deletePayment(kind, id, paymentId)}
            onResetPayments={(kind, id) => resetPayments(kind, id)}
          />
        )}
        {tab === "loans" && <LoansTab data={data} onAdd={addLoan} onRepay={repayLoan} onDelete={deleteLoan} onDeleteRepayment={deleteRepayment} />}
        {tab === "stock" && <StockTab data={data} productsById={productsById} totals={totals} onRestock={addRestock} onDeleteRestock={deleteRestock} />}
        {tab === "expenses" && <ExpensesTab data={data} totals={totals} onAdd={addExpense} onDelete={deleteExpense} />}
        {tab === "recycling" && (
          <RecyclingTab
            data={data}
            totals={totals}
            productsById={productsById}
            onAddCollection={addRecyclingCollection}
            onDeleteCollection={deleteRecyclingCollection}
            onAddSale={addRecyclingSale}
            onDeleteSale={deleteRecyclingSale}
          />
        )}
        {tab === "balance" && (
          <BalanceTab
            data={data}
            totals={totals}
            onSetCash={setInitialCash}
            onSetStartingCapital={setStartingCapital}
            onAddLiability={addLiability}
            onRemoveLiability={removeLiability}
            onAddWithdrawal={addWithdrawal}
            onDeleteWithdrawal={deleteWithdrawal}
            onAddPersonalNote={addPersonalNote}
            onDeletePersonalNote={deletePersonalNote}
          />
        )}
        {tab === "settings" && <SettingsTab data={data} onUpdate={updateProduct} onAddProduct={addProduct} onRestore={restoreData} onExported={markExported} onSetLotSeq={setLotSeq} onDeleteLot={deleteLotManually} />}
      </main>

      <nav
        className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-2xl mx-auto flex flex-nowrap text-xs leading-tight">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1.5 px-0.5 ${tab === key ? "text-teal-700" : "text-slate-400"}`}
            >
              <Icon size={15} strokeWidth={tab === key ? 2.4 : 2} />
              <span className="truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast && (
        <div
          className={`no-print fixed bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full text-sm shadow-lg text-white ${
            toast.kind === "error" ? "bg-rose-600" : "bg-teal-700"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Calculs -------------------------------- */

function computeTotals(data) {
  const paidSales = data.sales.reduce((s, x) => s + x.paidAmount, 0);
  const paidDetail = data.detailSales.reduce((s, x) => s + x.paidAmount, 0);
  const restockCost = data.restocks.reduce((s, x) => s + x.qty * x.unitCost, 0);
  // Un prêt "de départ" (déjà existant avant le début du suivi) ne sort pas
  // de trésorerie ici — l'argent était déjà sorti avant qu'on commence à
  // suivre. Seuls les nouveaux prêts accordés pendant le suivi réduisent la
  // trésorerie disponible. Les remboursements, eux, rentrent toujours en
  // trésorerie, qu'il s'agisse d'un prêt de départ ou d'un prêt nouveau.
  const loanedOut = data.loans.filter((x) => !x.isOpening).reduce((s, x) => s + x.amount, 0);
  const loanRepaid = data.loans.reduce((s, x) => s + repaidAmount(x), 0);
  const withdrawalsTotal = (data.withdrawals || []).reduce((s, x) => s + x.amount, 0);
  const expensesTotal = (data.expenses || []).reduce((s, x) => s + x.amount, 0);

  // Recyclage : bouteilles vides collectées gratuitement chez les clients
  // (protection de l'environnement) puis revendues — coût nul, donc le
  // produit de la vente est un bénéfice pur, et vient s'ajouter en trésorerie.
  const recyclingCollected = (data.recyclingCollections || []).reduce((s, c) => s + c.quantity, 0);
  const recyclingSoldQty = (data.recyclingSales || []).reduce((s, c) => s + c.quantity, 0);
  const recyclingStock = recyclingCollected - recyclingSoldQty;
  const recyclingRevenue = (data.recyclingSales || []).reduce((s, c) => s + c.quantity * c.unitPrice, 0);

  const treasury =
    data.meta.initialCash +
    paidSales +
    paidDetail -
    restockCost -
    loanedOut +
    loanRepaid -
    withdrawalsTotal -
    expensesTotal +
    recyclingRevenue;

  const receivables =
    data.sales.reduce((s, x) => s + Math.max(0, x.qty * x.unitPrice - x.paidAmount), 0) +
    data.detailSales.reduce((s, x) => s + Math.max(0, x.qty * x.unitPrice - x.paidAmount), 0);

  const loansOutstanding = data.loans.reduce((s, x) => s + Math.max(0, x.amount - repaidAmount(x)), 0);

  let stockValueGros = 0;
  let stockValueDetail = 0;
  Object.values(data.lots).forEach((row) => {
    stockValueGros += (row.gros || []).reduce((a, l) => a + l.qty * l.unitCost, 0);
    stockValueDetail += (row.detail || []).reduce((a, l) => a + l.qty * l.unitCost, 0);
  });
  const stockValue = stockValueGros + stockValueDetail;

  const liabilitiesTotal = data.liabilities.reduce((s, x) => s + x.amount, 0);

  const allOps = [
    ...data.sales.map((s) => ({ ...s, kind: "gros" })),
    ...data.detailSales.map((s) => ({ ...s, kind: "detail" })),
  ];
  const profitOf = (o) => o.qty * (o.unitPrice - o.unitCost);
  const revenueOf = (o) => o.qty * o.unitPrice;

  const byDay = (iso) => allOps.filter((o) => o.date === iso);
  const inMonth = (iso, ym) => iso.slice(0, 7) === ym;
  const inYear = (iso, y) => iso.slice(0, 4) === y;

  const today = todayISO();
  const ym = today.slice(0, 7);
  const y = today.slice(0, 4);

  const sumProfit = (ops) => ops.reduce((s, o) => s + profitOf(o), 0);
  const sumRevenue = (ops) => ops.reduce((s, o) => s + revenueOf(o), 0);

  const todayOps = byDay(today);
  const monthOps = allOps.filter((o) => inMonth(o.date, ym));
  const yearOps = allOps.filter((o) => inYear(o.date, y));

  // Provision fiscale — TPU (Taxe Professionnelle Unique), régime applicable
  // aux personnes physiques dont le CA annuel ne dépasse pas 60 M FCFA :
  // 2,5 % du chiffre d'affaires (commerce), avec un minimum légal de 20 000
  // F/an. Calculée sur le CA réellement encaissé/facturé de l'année civile
  // en cours (pas une projection) — donc elle grossit au fil de l'année.
  const tpuBase = sumRevenue(yearOps);
  const tpuEstimate = Math.max(TPU_MINIMUM, tpuBase * TPU_RATE);

  const assets = treasury + stockValue + receivables + loansOutstanding;
  const netWorth = assets - liabilitiesTotal - tpuEstimate;
  const startingCapital = data.meta.startingCapital || 0;
  const netResult = netWorth - startingCapital;

  // 14 derniers jours pour le graphique
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (13 - i));
    return localISO(d);
  });
  const chartData = days.map((d) => ({
    day: d.slice(5),
    benefice: sumProfit(byDay(d)),
  }));

  // Synthèse des 12 derniers mois : coût d'achat des articles VENDUS (pas
  // les réappros du mois, qui n'ont pas de lien direct avec les ventes du
  // mois) vs ventes (CA) vs bénéfice. Ainsi : ventes - coût d'achat = bénéfice.
  const months = [...Array(12)].map((_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    return localISO(d).slice(0, 7);
  });
  const costOf = (o) => o.qty * o.unitCost;
  const monthlyData = months.map((m) => {
    const opsInMonth = allOps.filter((o) => inMonth(o.date, m));
    const coutAchat = opsInMonth.reduce((s, o) => s + costOf(o), 0);
    return {
      month: m,
      label: new Date(m + "-01T00:00:00Z").toLocaleDateString("fr-FR", { month: "short", year: "2-digit", timeZone: "UTC" }),
      achats: coutAchat,
      ventes: sumRevenue(opsInMonth),
      benefice: sumProfit(opsInMonth),
    };
  });

  return {
    treasury,
    receivables,
    loansOutstanding,
    stockValue,
    stockValueGros,
    stockValueDetail,
    liabilitiesTotal,
    tpuEstimate,
    assets,
    netWorth,
    startingCapital,
    netResult,
    withdrawalsTotal,
    expensesTotal,
    recyclingStock,
    recyclingCollected,
    recyclingSoldQty,
    recyclingRevenue,
    profitOf,
    revenueOf,
    today: { profit: sumProfit(todayOps), revenue: sumRevenue(todayOps), count: todayOps.length },
    month: { profit: sumProfit(monthOps), revenue: sumRevenue(monthOps), count: monthOps.length },
    year: { profit: sumProfit(yearOps), revenue: sumRevenue(yearOps), count: yearOps.length },
    chartData,
    monthlyData,
    allOps,
  };
}

/* ------------------------------ UI pièces ------------------------------- */

function Card({ children, className = "", ...rest }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-slate-700">
      {Icon && <Icon size={16} className="text-teal-700" />}
      <h2 className="font-bold text-sm tracking-tight">{children}</h2>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "teal" }) {
  const tones = {
    teal: "text-teal-700",
    rose: "text-rose-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`font-mono font-bold text-lg tabular-nums ${tones[tone]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 ${props.className || ""}`}
    />
  );
}

function Btn({ children, onClick, kind = "primary", className = "", type = "button", disabled }) {
  const kinds = {
    primary: "bg-teal-700 text-white active:bg-teal-800",
    ghost: "bg-slate-100 text-slate-700 active:bg-slate-200",
    danger: "bg-rose-50 text-rose-600 active:bg-rose-100",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40 ${kinds[kind]} ${className}`}
    >
      {children}
    </button>
  );
}

function productOptions(products, brand, filterFn) {
  return products
    .filter((p) => (!brand || p.brand === brand) && (!filterFn || filterFn(p)))
    .map((p) => ({ value: p.id, label: `${p.format}` }));
}

/* ------------------------------- Dashboard ------------------------------ */

/* Navigateur de date : recule/avance jour par jour ou de 7 jours, ou saute  */
/* directement à une date via le calendrier natif.                          */
function DateNav({ value, onChange }) {
  const busyRef = useRef(false);
  const shift = (days) => {
    // Garde-fou : ignore tout second appel qui arriverait dans la même
    // fraction de seconde (double déclenchement du clic sur ordinateur).
    if (busyRef.current) return;
    busyRef.current = true;
    setTimeout(() => { busyRef.current = false; }, 200);
    // Coupe le focus du champ date natif : sur ordinateur, un champ date
    // encore focus peut réagir lui-même aux flèches/molette et fausser le
    // résultat du clic sur nos propres boutons.
    if (document.activeElement && document.activeElement.tagName === "INPUT") {
      document.activeElement.blur();
    }
    const d = new Date(value + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    onChange(localISO(d));
  };
  const isToday = value === todayISO();
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shift(-7); }}
        className="relative z-10 p-1.5 rounded-lg bg-slate-100 text-slate-500 active:bg-slate-200"
        title="-7 jours"
      >
        <ChevronsLeft size={15} />
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shift(-1); }}
        className="relative z-10 p-1.5 rounded-lg bg-slate-100 text-slate-500 active:bg-slate-200"
        title="Jour précédent"
      >
        <ChevronLeft size={15} />
      </button>
      <div className="relative flex-1">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
      </div>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shift(1); }}
        className="relative z-10 p-1.5 rounded-lg bg-slate-100 text-slate-500 active:bg-slate-200"
        title="Jour suivant"
      >
        <ChevronRight size={15} />
      </button>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); shift(7); }}
        className="relative z-10 p-1.5 rounded-lg bg-slate-100 text-slate-500 active:bg-slate-200"
        title="+7 jours"
      >
        <ChevronsRight size={15} />
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(todayISO()); }}
          className="relative z-10 px-2 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold whitespace-nowrap"
        >
          Aujourd'hui
        </button>
      )}
    </div>
  );
}

function Dashboard({ data, totals, productsById }) {
  const brands = brandsOf(data.products);
  const [journalDate, setJournalDate] = useState(todayISO());
  const journalOps = useMemo(
    () => totals.allOps.filter((o) => o.date === journalDate).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [totals.allOps, journalDate]
  );
  const journalProfit = journalOps.reduce((s, o) => s + totals.profitOf(o), 0);
  const journalRevenue = journalOps.reduce((s, o) => s + totals.revenueOf(o), 0);
  const [showAllBestSellers, setShowAllBestSellers] = useState(false);
  const bestSellers = useMemo(() => {
    const map = {};
    totals.allOps.forEach((o) => {
      if (!map[o.productId]) map[o.productId] = { gros: 0, detail: 0 };
      if (o.kind === "detail") map[o.productId].detail += o.qty;
      else map[o.productId].gros += o.qty;
    });
    return Object.entries(map)
      .map(([id, q]) => ({ id, gros: q.gros, detail: q.detail, p: productsById[id] }))
      .filter((x) => x.p)
      .sort((a, b) => b.gros + b.detail - (a.gros + a.detail));
  }, [totals.allOps, productsById]);
  const bestSellersShown = showAllBestSellers ? bestSellers : bestSellers.slice(0, 5);

  const lastExport = data.meta.lastExportAt ? new Date(data.meta.lastExportAt) : null;
  const daysSinceExport = lastExport ? Math.round((Date.now() - lastExport.getTime()) / 86400000) : null;
  const exportOverdue = daysSinceExport === null || daysSinceExport > 3;

  // Rapport imprimable : synthèse de toutes les rubriques (ventes, achats,
  // dépenses, bénéfice) sur une période libre (du ... au ...), avec des
  // raccourcis pour mois / semestre / année en cours.
  const monthBounds = (ref) => {
    const [y, m] = ref.slice(0, 7).split("-").map(Number);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { start: `${ref.slice(0, 7)}-01`, end: `${ref.slice(0, 7)}-${String(last).padStart(2, "0")}` };
  };
  const today0 = todayISO();
  const defaultBounds = monthBounds(today0);
  const [reportStart, setReportStart] = useState(defaultBounds.start);
  const [reportEnd, setReportEnd] = useState(defaultBounds.end);

  const applyPreset = (key) => {
    const y = today0.slice(0, 4);
    const addDays = (iso, n) => {
      const d = new Date(iso + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + n);
      return localISO(d);
    };
    if (key === "today") {
      setReportStart(today0);
      setReportEnd(today0);
    } else if (key === "week") {
      const d = new Date(today0 + "T00:00:00Z");
      const dow = d.getUTCDay(); // 0 = dimanche
      const diffToMonday = dow === 0 ? -6 : 1 - dow;
      const monday = addDays(today0, diffToMonday);
      setReportStart(monday);
      setReportEnd(addDays(monday, 6));
    } else if (key === "twoWeeks") {
      setReportStart(addDays(today0, -13));
      setReportEnd(today0);
    } else if (key === "thisMonth") {
      const b = monthBounds(today0);
      setReportStart(b.start);
      setReportEnd(b.end);
    } else if (key === "lastMonth") {
      const [yy, mm] = today0.slice(0, 7).split("-").map(Number);
      const prevY = mm === 1 ? yy - 1 : yy;
      const prevM = mm === 1 ? 12 : mm - 1;
      const b = monthBounds(`${prevY}-${String(prevM).padStart(2, "0")}-01`);
      setReportStart(b.start);
      setReportEnd(b.end);
    } else if (key === "quarter") {
      const m = Number(today0.slice(5, 7));
      const qStartMonth = Math.floor((m - 1) / 3) * 3 + 1; // 1, 4, 7 ou 10
      const qEndMonth = qStartMonth + 2;
      const b = monthBounds(`${y}-${String(qEndMonth).padStart(2, "0")}-01`);
      setReportStart(`${y}-${String(qStartMonth).padStart(2, "0")}-01`);
      setReportEnd(b.end);
    } else if (key === "semester") {
      const m = Number(today0.slice(5, 7));
      if (m <= 6) {
        setReportStart(`${y}-01-01`);
        setReportEnd(`${y}-06-30`);
      } else {
        setReportStart(`${y}-07-01`);
        setReportEnd(`${y}-12-31`);
      }
    } else if (key === "year") {
      setReportStart(`${y}-01-01`);
      setReportEnd(`${y}-12-31`);
    }
  };

  const reportStats = useMemo(() => {
    const inRange = (d) => d >= reportStart && d <= reportEnd;
    const ops = totals.allOps.filter((o) => inRange(o.date));
    const expenses = (data.expenses || []).filter((e) => inRange(e.date));
    const restocks = (data.restocks || []).filter((r) => inRange(r.date));
    const recyclingSales = (data.recyclingSales || []).filter((s) => inRange(s.date));
    const ventesCA = ops.reduce((s, o) => s + totals.revenueOf(o), 0);
    const benefice = ops.reduce((s, o) => s + totals.profitOf(o), 0);
    const depenses = expenses.reduce((s, e) => s + e.amount, 0);
    const achats = restocks.reduce((s, r) => s + r.qty * r.unitCost, 0);
    const recyclage = recyclingSales.reduce((s, r) => s + r.quantity * r.unitPrice, 0);
    return { count: ops.length, ventesCA, benefice, depenses, achats, recyclage, resultat: benefice + recyclage - depenses };
  }, [totals.allOps, data.expenses, data.restocks, data.recyclingSales, reportStart, reportEnd, totals]);

  const fmtShort = (iso) => new Date(iso + "T00:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const reportLabel = reportStart === reportEnd ? fmtShort(reportStart) : `du ${fmtShort(reportStart)} au ${fmtShort(reportEnd)}`;

  const [quoteDate, setQuoteDate] = useState(todayISO());
  const waterQuote = useMemo(() => getQuote("Eau", new Date(quoteDate + "T00:00:00Z")), [quoteDate]);
  const recyclingQuote = useMemo(() => getQuote("Recyclage", new Date(quoteDate + "T00:00:00Z")), [quoteDate]);

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Accueil" />
      {exportOverdue && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          {lastExport
            ? `Dernière sauvegarde il y a ${daysSinceExport} j — pense à en exporter une nouvelle (onglet Produits).`
            : "Aucune sauvegarde exportée pour l'instant — fais-en une dans l'onglet Produits."}
        </div>
      )}

      <Card data-print-section="citations">
        <SectionTitle icon={Droplet}>Citations du jour</SectionTitle>
        <div className="space-y-3">
          <DateNav value={quoteDate} onChange={setQuoteDate} />
          <p className="text-xs text-slate-400 text-center -mt-1">
            {new Date(quoteDate + "T00:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
            {quoteDate !== todayISO() && " (le cycle se répète chaque année)"}
          </p>
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-sm text-slate-700 italic">"{waterQuote.text}"</p>
            <p className="text-xs text-slate-500 mt-1">— {waterQuote.author}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <p className="text-sm text-slate-700 italic">"{recyclingQuote.text}"</p>
            <p className="text-xs text-slate-500 mt-1">— {recyclingQuote.author}</p>
          </div>
          <ShareOrCopy
            getText={() =>
              `💧 "${waterQuote.text}" — ${waterQuote.author}\n\n♻️ "${recyclingQuote.text}" — ${recyclingQuote.author}\n\nMultivers'Eau`
            }
          />
          <PrintOrCopy
            printKey="citations"
            getText={() =>
              `💧 "${waterQuote.text}" — ${waterQuote.author}\n\n♻️ "${recyclingQuote.text}" — ${recyclingQuote.author}\n\nMultivers'Eau`
            }
          />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Bénéfice jour" value={fcfa(totals.today.profit)} sub={`${totals.today.count} vente(s)`} />
        <StatCard label="Bénéfice mois" value={fcfa(totals.month.profit)} tone="slate" />
        <StatCard label="Bénéfice année" value={fcfa(totals.year.profit)} tone="slate" />
      </div>

      <Card data-print-section="journal">
        <div className="flex items-center justify-between mb-1">
          <SectionTitle icon={Calendar}>Journal du jour</SectionTitle>
        </div>
        <DateNav value={journalDate} onChange={setJournalDate} />
        <div className="flex justify-between mt-3 mb-1 text-xs">
          <span className="text-slate-500">
            {new Date(journalDate + "T00:00:00Z").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
          </span>
          <span className="font-mono">
            CA {fcfa(journalRevenue)} • Bénéfice <b className="text-teal-700">{fcfa(journalProfit)}</b>
          </span>
        </div>
        {journalOps.length === 0 && <p className="text-sm text-slate-400 py-2">Aucune vente ce jour-là.</p>}
        <ul className="divide-y divide-slate-100">
          {journalOps.map((o) => {
            const p = productsById[o.productId];
            return (
              <li key={o.id} className="py-1.5 text-xs flex justify-between">
                <span>
                  {o.kind === "detail" ? <Scissors size={10} className="inline mr-1 text-slate-400" /> : null}
                  {o.client} — {p?.brand} {p?.format}
                  {o.kind === "detail" ? " (u.)" : ""} × {o.qty}
                </span>
                <span className="font-mono">
                  {fcfa(o.qty * o.unitPrice)} <span className="text-teal-700">(+{fcfa(totals.profitOf(o))})</span>
                </span>
              </li>
            );
          })}
        </ul>
        <PrintOrCopy
          printKey="journal"
          getText={() =>
            `Journal du ${new Date(journalDate + "T00:00:00Z").toLocaleDateString("fr-FR", { timeZone: "UTC" })} — Multivers'Eau\n` +
            `CA : ${fcfa(journalRevenue)}\nBénéfice : ${fcfa(journalProfit)}\n\n` +
            journalOps
              .map((o) => {
                const p = productsById[o.productId];
                return `${o.client} — ${p?.brand} ${p?.format}${o.kind === "detail" ? " (u.)" : ""} × ${o.qty} : ${fcfa(o.qty * o.unitPrice)}`;
              })
              .join("\n")
          }
        />
      </Card>

      <Card data-print-section="rapport">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle icon={Printer}>Rapport — toutes rubriques</SectionTitle>
        </div>
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {[
            { key: "today", label: "Quotidien" },
            { key: "week", label: "Hebdomadaire" },
            { key: "twoWeeks", label: "Bihebdomadaire" },
            { key: "lastMonth", label: "Mois dernier" },
            { key: "thisMonth", label: "Ce mois" },
            { key: "quarter", label: "Trimestriel" },
            { key: "semester", label: "Semestre" },
            { key: "year", label: "Année" },
          ].map((g) => (
            <button
              key={g.key}
              onClick={() => applyPreset(g.key)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500"
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-xs text-slate-400">Du</label>
            <Input type="date" value={reportStart} onChange={(e) => setReportStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Au</label>
            <Input type="date" value={reportEnd} onChange={(e) => setReportEnd(e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-2">{reportLabel} — {reportStats.count} vente(s)</p>
        <Row label="Ventes (CA)" value={fcfa(reportStats.ventesCA)} />
        <Row label="Achats (réappro)" value={fcfa(reportStats.achats)} />
        <Row label="Dépenses" value={fcfa(reportStats.depenses)} />
        <Row label="Recyclage (bénéfice pur)" value={fcfa(reportStats.recyclage)} />
        <Row label="Bénéfice brut (eau)" value={fcfa(reportStats.benefice)} />
        <Row
          label="Résultat (bénéfice + recyclage − dépenses)"
          value={fcfa(reportStats.resultat)}
          bold
          tone={reportStats.resultat >= 0 ? "teal" : "rose"}
        />
        <PrintOrCopy
          className="mt-2"
          printKey="rapport"
          getText={() =>
            `Rapport Multivers'Eau — ${reportLabel}\n` +
            `Ventes (CA) : ${fcfa(reportStats.ventesCA)}\n` +
            `Achats (réappro) : ${fcfa(reportStats.achats)}\n` +
            `Dépenses : ${fcfa(reportStats.depenses)}\n` +
            `Recyclage : ${fcfa(reportStats.recyclage)}\n` +
            `Bénéfice brut (eau) : ${fcfa(reportStats.benefice)}\n` +
            `Résultat : ${fcfa(reportStats.resultat)}`
          }
        />
      </Card>

      <Card data-print-section="chart14">
        <SectionTitle icon={TrendingUp}>Bénéfice — 14 derniers jours</SectionTitle>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={totals.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} width={36} />
              <RTooltip formatter={(v) => fcfa(v)} labelFormatter={(l) => `Jour ${l}`} />
              <Bar dataKey="benefice" fill="#0E5C63" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ScopedPrintButton printKey="chart14" label="Imprimer ce graphique" />
      </Card>

      <Card data-print-section="chart12">
        <SectionTitle icon={TrendingUp}>Synthèse mensuelle — coût d'achat vs ventes</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          "Coût d'achat" = ce qu'ont coûté les articles réellement vendus ce mois-ci (pas les réappros du mois). Ventes − Coût d'achat
          = Bénéfice.
        </p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <ComposedChart data={totals.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} width={40} />
              <RTooltip formatter={(v) => fcfa(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="achats" name="Coût d'achat (ventes)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="ventes" name="Ventes (CA)" fill="#0E5C63" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="benefice" name="Bénéfice" stroke="#e11d48" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ScopedPrintButton printKey="chart12" label="Imprimer ce graphique" />
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Trésorerie" value={fcfa(totals.treasury)} />
        <StatCard label="Valeur stock total" value={fcfa(totals.stockValue)} />
        <StatCard label="— dont gros" value={fcfa(totals.stockValueGros)} tone="slate" />
        <StatCard label="— dont détail (capital immobilisé)" value={fcfa(totals.stockValueDetail)} tone="slate" />
        <StatCard label="Créances clients" value={fcfa(totals.receivables)} tone="amber" />
        <StatCard label="Prêts en cours" value={fcfa(totals.loansOutstanding)} tone="amber" />
        <StatCard label="TPU à provisionner (année en cours)" value={fcfa(totals.tpuEstimate)} tone="amber" />
      </div>

      <Card>
        <SectionTitle icon={PiggyBank}>Objectif — dette investisseur</SectionTitle>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Valeur nette : {fcfa(totals.netWorth)}</span>
          <span>Objectif : {fcfa(totals.startingCapital)}</span>
        </div>
        <ProgressBar value={totals.netWorth} target={totals.startingCapital} />
        <div className={`text-xs font-semibold mt-1 ${totals.netResult >= 0 ? "text-teal-700" : "text-amber-600"}`}>
          {totals.netResult >= 0
            ? `Excédent réel : ${fcfa(totals.netResult)}`
            : `Reste à générer avant excédent : ${fcfa(-totals.netResult)}`}
        </div>
      </Card>

      <Card data-print-section="topsellers">
        <SectionTitle icon={Package}>Top articles vendus (cumul)</SectionTitle>
        {bestSellers.length === 0 && <p className="text-sm text-slate-400">Aucune vente enregistrée pour le moment.</p>}
        <ul className="divide-y divide-slate-100">
          {bestSellersShown.map(({ id, gros, detail, p }) => (
            <li key={id} className="py-1.5 text-sm">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${getBrandColor(p.brand).dot}`} />
                {p.brand} — {p.format}
              </div>
              <div className="flex justify-end gap-4 text-xs">
                <span className={gros === 0 ? "text-slate-300" : "text-slate-500"}>
                  Gros : <b className="font-mono">{gros}</b>
                </span>
                <span className={detail === 0 ? "text-slate-300" : "text-slate-500"}>
                  Détail (u.) : <b className="font-mono">{detail}</b>
                </span>
              </div>
            </li>
          ))}
        </ul>
        {bestSellers.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllBestSellers((v) => !v)}
            className="w-full text-center text-xs font-semibold text-teal-700 mt-2 py-1.5 rounded-lg bg-teal-50"
          >
            {showAllBestSellers ? "Voir moins" : `Voir plus (${bestSellers.length - 5} de plus)`}
          </button>
        )}
        <PrintOrCopy
          className="mt-2"
          printKey="topsellers"
          getText={() =>
            `Top articles vendus (cumul) — Multivers'Eau\n\n` +
            bestSellers.map(({ p, gros, detail }) => `${p.brand} — ${p.format} : Gros ${gros}, Détail ${detail}`).join("\n")
          }
        />
      </Card>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {brands.map((b) => {
          const c = getBrandColor(b);
          const stockQty = Object.entries(data.lots)
            .filter(([id]) => id.startsWith(b))
            .reduce((s, [, row]) => s + lotsQty(row.gros), 0);
          return (
            <div key={b} className={`rounded-2xl p-3 ${c.bg} ring-1 ${c.ring}`}>
              <div className={`text-xs font-bold ${c.text}`}>{b}</div>
              <div className="text-lg font-mono font-bold tabular-nums">{stockQty}</div>
              <div className="text-xs text-slate-500">colis en stock</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------- Ventes --------------------------------- */

function emptyCatchUpRow() {
  return { rid: uid(), date: todayISO(), brand: "VOLTIC", productId: "", client: "", qty: 1, unitPrice: "", mode: "cash" };
}

function CatchUpBatch({ data, productsById, onBatchAdd, onClose }) {
  const [rows, setRows] = useState([emptyCatchUpRow()]);

  const updateRow = (rid, patch) => setRows((rs) => rs.map((r) => (r.rid === rid ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, emptyCatchUpRow()]);
  const removeRow = (rid) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.rid !== rid) : rs));

  const onBrandChange = (rid, brand) => updateRow(rid, { brand, productId: "", unitPrice: "" });
  const onProductChange = (rid, productId) => {
    const p = productsById[productId];
    updateRow(rid, { productId, unitPrice: p ? p.sellPrice : "" });
  };

  const validRows = rows.filter((r) => r.productId && r.qty && r.unitPrice);
  const totalAmount = validRows.reduce((s, r) => s + Number(r.qty) * Number(r.unitPrice), 0);

  const submitAll = () => {
    if (validRows.length === 0) return;
    const failed = onBatchAdd(
      validRows.map((r) => ({
        date: r.date,
        client: r.client,
        productId: r.productId,
        qty: Number(r.qty),
        unitPrice: Number(r.unitPrice),
        mode: r.mode,
      }))
    );
    if (!failed || failed.length === 0) {
      setRows([emptyCatchUpRow()]);
      onClose();
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs text-slate-500">
        Astuce : l'ordre de saisie des lignes n'a pas besoin d'être parfait — l'appli trie automatiquement par date avant d'appliquer
        le FIFO. Utilise juste la vraie date de chaque vente.
      </p>
      {rows.map((r, idx) => {
        const opts = productOptions(data.products, r.brand);
        return (
          <div key={r.rid} className="border border-slate-100 rounded-lg p-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ligne {idx + 1}</span>
              <button onClick={() => removeRow(r.rid)}>
                <Trash2 size={13} className="text-rose-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Input type="date" value={r.date} onChange={(e) => updateRow(r.rid, { date: e.target.value })} />
              <Input placeholder="Client" value={r.client} onChange={(e) => updateRow(r.rid, { client: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Select value={r.brand} onChange={(v) => onBrandChange(r.rid, v)} options={brandsOf(data.products).map((b) => ({ value: b, label: b }))} />
              <div className="col-span-2">
                <Select value={r.productId} onChange={(v) => onProductChange(r.rid, v)} options={opts} placeholder="Format" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Input type="number" min="1" placeholder="Qté" value={r.qty} onChange={(e) => updateRow(r.rid, { qty: e.target.value })} />
              <Input type="number" placeholder="Prix vente" value={r.unitPrice} onChange={(e) => updateRow(r.rid, { unitPrice: e.target.value })} />
              <Select value={r.mode} onChange={(v) => updateRow(r.rid, { mode: v })} options={[{ value: "cash", label: "Cash" }, { value: "credit", label: "Crédit" }]} />
            </div>
          </div>
        );
      })}
      <Btn onClick={addRow} kind="ghost" className="w-full">
        <Plus size={14} /> Ajouter une ligne
      </Btn>
      {validRows.length > 0 && (
        <div className="text-xs text-slate-500">
          {validRows.length} vente(s) prête(s) — total <b>{fcfa(totalAmount)}</b>
        </div>
      )}
      <Btn onClick={submitAll} className="w-full" disabled={validRows.length === 0}>
        <Check size={16} /> Importer {validRows.length > 0 ? `(${validRows.length})` : ""}
      </Btn>
    </div>
  );
}

function SalesTab({ data, productsById, onAdd, onBatchAdd, onDelete }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [form, setForm] = useState({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  const [showCatchUp, setShowCatchUp] = useState(false);

  const options = productOptions(data.products, brand);

  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitPrice: p ? p.sellPrice : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitPrice) return;
    const ok = onAdd({ ...form, qty: Number(form.qty), unitPrice: Number(form.unitPrice) });
    if (ok) setForm({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  };

  const list = data.sales.slice(0, 40);

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Ventes" />
      <Card>
        <SectionTitle icon={ShoppingCart}>Nouvelle vente en gros</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Nom du client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select
            value={brand}
            onChange={(v) => {
              setBrand(v);
              setForm((f) => ({ ...f, productId: "", unitPrice: "" }));
            }}
            options={brandsOf(data.products).map((b) => ({ value: b, label: b }))}
          />
          <div className="col-span-2">
            <Select value={form.productId} onChange={onProductChange} options={options} placeholder="Choisir le format" />
          </div>
        </div>
        {form.productId && (
          <div className="text-xs text-slate-500 mb-2">
            Stock gros disponible : <b>{lotsQty(data.lots[form.productId]?.gros)}</b> • Dernier prix d'achat : {fcfa(productsById[form.productId].purchase)}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Prix unit. vente" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <Select
            value={form.mode}
            onChange={(v) => setForm({ ...form, mode: v })}
            options={[{ value: "cash", label: "Payé cash" }, { value: "credit", label: "À crédit" }]}
          />
        </div>
        {form.productId && form.qty && form.unitPrice && (
          <div className="text-xs text-slate-500 mb-2">
            Total : <b>{fcfa(form.qty * form.unitPrice)}</b> — Bénéfice estimé :{" "}
            <b className="text-teal-700">{fcfa(form.qty * (form.unitPrice - weightedCost(data.lots[form.productId]?.gros)))}</b>
          </div>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer la vente
        </Btn>
      </Card>

      <Card>
        <button className="w-full flex items-center justify-between" onClick={() => setShowCatchUp((v) => !v)}>
          <SectionTitle icon={Calendar}>Rattrapage — saisir plusieurs ventes passées</SectionTitle>
          <span className="text-slate-400 text-lg">{showCatchUp ? "▲" : "▼"}</span>
        </button>
        {!showCatchUp && (
          <p className="text-xs text-slate-500">
            Pour intégrer tes ventes depuis le 11 juin, ouvre ce panneau : ajoute une ligne par vente réelle (avec sa vraie date), puis
            importe tout d'un coup.
          </p>
        )}
        {showCatchUp && <CatchUpBatch data={data} productsById={productsById} onBatchAdd={onBatchAdd} onClose={() => setShowCatchUp(false)} />}
      </Card>

      <div data-print-section="historique-ventes-gros">
      <Card>
        <SectionTitle icon={ShoppingCart}>Historique (40 dernières)</SectionTitle>
        {list.length === 0 && <p className="text-sm text-slate-400">Aucune vente enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {list.map((s) => {
            const p = productsById[s.productId];
            const due = s.qty * s.unitPrice - s.paidAmount;
            return (
              <li key={s.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">{s.client}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-xs">{new Date(s.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>
                    <ConfirmDeleteButton
                      onConfirm={() => onDelete(s.id)}
                      label={`Supprimer cette vente (${p?.brand} ${p?.format} × ${s.qty}) ? Le stock sera restitué.`}
                    />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>
                    {p?.brand} {p?.format} × {s.qty}
                  </span>
                  <span className="font-mono">{fcfa(s.qty * s.unitPrice)}</span>
                </div>
                <div className="text-xs flex justify-between mt-0.5">
                  <span className={due > 0 ? "text-amber-600 font-semibold" : "text-teal-700"}>
                    {due > 0 ? `Solde dû : ${fcfa(due)}` : "Payé intégralement"}
                  </span>
                  <span className="text-slate-400">Bénéfice {fcfa(s.qty * (s.unitPrice - s.unitCost))}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      {list.length > 0 && (
        <PrintOrCopy
          printKey="historique-ventes-gros"
          getText={() =>
            `Historique des ventes en gros — Multivers'Eau\n\n` +
            list
              .map((s) => {
                const p = productsById[s.productId];
                return `${s.date} — ${s.client} — ${p?.brand} ${p?.format} × ${s.qty} : ${fcfa(s.qty * s.unitPrice)}`;
              })
              .join("\n")
          }
        />
      )}
      </div>
    </div>
  );
}

/* ------------------------------- Vente détail ----------------------------- */

function DetailTab({ data, totals, productsById, onOpen, onSell, onDeleteSale, onDeleteOpening, onForceCloseOpening, onMergeLots }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [openId, setOpenId] = useState("");
  const [openDate, setOpenDate] = useState(todayISO());
  const [form, setForm] = useState({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });

  const openableOptions = productOptions(data.products, brand, (p) => lotsQty(data.lots[p.id]?.gros) > 0);
  const sellableOptions = productOptions(data.products, brand, (p) => lotsQty(data.lots[p.id]?.detail) > 0);

  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitPrice: p ? p.retailPrice : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitPrice) return;
    const ok = onSell({ ...form, qty: Number(form.qty), unitPrice: Number(form.unitPrice) });
    if (ok) setForm({ date: todayISO(), client: "", productId: "", qty: 1, unitPrice: "", mode: "cash" });
  };

  const list = data.detailSales.slice(0, 40);

  // Suivi par colis ouvert : combien d'unités ont déjà été vendues sur
  // chaque lot détail encore actif (le reste du lot correspond au capital
  // immobilisé — rien n'est compté comme vendu tant qu'il n'est pas sorti).
  const openPacksInProgress = [];
  data.products.forEach((p) => {
    const detailLots = data.lots[p.id]?.detail || [];
    sortLots(detailLots).forEach((l) => {
      if (l.qty > 0) {
        openPacksInProgress.push({
          key: l.id,
          product: p,
          lotNo: l.lotNo,
          date: l.date,
          sold: l.originalQty - l.qty,
          total: l.originalQty,
          remaining: l.qty,
        });
      }
    });
  });

  const openingsList = data.openings.slice(0, 30);

  // Produits dont le stock détail est éclaté en plusieurs lots séparés —
  // souvent des restes de l'ancien bug de restitution, à fusionner.
  const fragmentedProducts = data.products.filter((p) => (data.lots[p.id]?.detail || []).length > 1);

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Détail" />
      <StatCard
        label="Capital immobilisé en détail"
        value={fcfa(totals.stockValueDetail)}
        sub="Coût des bouteilles déjà ouvertes mais pas encore vendues"
        tone="amber"
      />

      {fragmentedProducts.length > 0 && (
        <Card>
          <SectionTitle icon={Scissors}>Lots détail fragmentés</SectionTitle>
          <p className="text-xs text-slate-500 mb-2">
            Ces articles ont plusieurs lots détail séparés (souvent des restes de l'ancien bug de restitution) — les fusionner ne
            change ni ne supprime aucune unité, ça regroupe juste tout en un seul lot propre.
          </p>
          <ul className="divide-y divide-slate-100">
            {fragmentedProducts.map((p) => (
              <li key={p.id} className="py-1.5 flex items-center justify-between text-sm">
                <span>
                  {p.brand} {p.format} — {(data.lots[p.id]?.detail || []).length} lots
                </span>
                <Btn kind="ghost" onClick={() => onMergeLots(p.id)}>
                  Fusionner
                </Btn>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div data-print-section="colis-ouverts">
      <Card>
        <SectionTitle icon={Package}>Suivi des colis ouverts</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Pour chaque colis ouvert : combien d'unités ont réellement été vendues jusqu'ici, et combien restent à vendre.
        </p>
        {openPacksInProgress.length === 0 && <p className="text-sm text-slate-400">Aucun colis ouvert en cours.</p>}
        <ul className="divide-y divide-slate-100">
          {openPacksInProgress.map((o) => (
            <li key={o.key} className="py-2 text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-slate-700">
                  {o.product.brand} {o.product.format} — Lot #{o.lotNo}
                </span>
                <span className="text-slate-400">{new Date(o.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600" style={{ width: `${(o.sold / o.total) * 100}%` }} />
                </div>
                <span className="text-slate-500 shrink-0">
                  {o.sold}/{o.total} vendues ({o.remaining} restantes)
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      {openPacksInProgress.length > 0 && (
        <PrintOrCopy
          printKey="colis-ouverts"
          getText={() =>
            `Suivi des colis ouverts — Multivers'Eau\n\n` +
            openPacksInProgress.map((o) => `${o.product.brand} ${o.product.format} — Lot #${o.lotNo} : ${o.sold}/${o.total} vendues (${o.remaining} restantes)`).join("\n")
          }
        />
      )}
      </div>

      <Card>
        <SectionTitle icon={Scissors}>1. Ouvrir un colis pour le détail</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Décompose un carton/pack acheté au prix fournisseur en bouteilles unitaires, revendues plus cher à l'unité (double bénéfice).
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
          <Select value={brand} onChange={(v) => { setBrand(v); setOpenId(""); }} options={brandsOf(data.products).map((b) => ({ value: b, label: b }))} />
          <Select value={openId} onChange={setOpenId} options={openableOptions} placeholder="Colis" />
        </div>
        {openId && (
          <div className="text-xs text-slate-500 mb-2">
            {productsById[openId].units} unités seront ajoutées au stock détail (coût hérité du plus ancien lot). Stock gros restant après ouverture :{" "}
            {lotsQty(data.lots[openId]?.gros) - 1}
          </div>
        )}
        <Btn onClick={() => { if (openId) { onOpen(openId, openDate); setOpenId(""); } }} className="w-full" disabled={!openId}>
          <Scissors size={16} /> Ouvrir ce colis
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={ShoppingCart}>2. Vendre à l'unité</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Nom du client" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select value={brand} onChange={(v) => { setBrand(v); setForm((f) => ({ ...f, productId: "", unitPrice: "" })); }} options={brandsOf(data.products).map((b) => ({ value: b, label: b }))} />
          <div className="col-span-2">
            <Select value={form.productId} onChange={onProductChange} options={sellableOptions} placeholder="Article (stock détail)" />
          </div>
        </div>
        {form.productId && (
          <div className="text-xs text-slate-500 mb-2">
            Unités disponibles : <b>{lotsQty(data.lots[form.productId]?.detail)}</b> • Coût unitaire (FIFO) :{" "}
            {fcfa(weightedCost(data.lots[form.productId]?.detail))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Prix unit. détail" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
          <Select value={form.mode} onChange={(v) => setForm({ ...form, mode: v })} options={[{ value: "cash", label: "Payé cash" }, { value: "credit", label: "À crédit" }]} />
        </div>
        {form.productId && form.qty && form.unitPrice && (
          <div className="text-xs text-slate-500 mb-2">
            Total : <b>{fcfa(form.qty * form.unitPrice)}</b> — Bénéfice estimé :{" "}
            <b className="text-teal-700">
              {fcfa(form.qty * (form.unitPrice - weightedCost(data.lots[form.productId]?.detail)))}
            </b>
          </div>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer la vente au détail
        </Btn>
      </Card>

      <div data-print-section="historique-detail">
      <Card>
        <SectionTitle icon={Scissors}>Historique détail (40 dernières)</SectionTitle>
        {list.length === 0 && <p className="text-sm text-slate-400">Aucune vente au détail.</p>}
        <ul className="divide-y divide-slate-100">
          {list.map((s) => {
            const p = productsById[s.productId];
            const due = s.qty * s.unitPrice - s.paidAmount;
            return (
              <li key={s.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">{s.client}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-400 text-xs">{new Date(s.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>
                    <ConfirmDeleteButton
                      onConfirm={() => onDeleteSale(s.id)}
                      label={`Supprimer cette vente détail (${p?.brand} ${p?.format} × ${s.qty}) ? Le stock détail sera restitué.`}
                    />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>{p?.brand} {p?.format} (unité) × {s.qty}</span>
                  <span className="font-mono">{fcfa(s.qty * s.unitPrice)}</span>
                </div>
                <div className="text-xs flex justify-between mt-0.5">
                  <span className={due > 0 ? "text-amber-600 font-semibold" : "text-teal-700"}>
                    {due > 0 ? `Solde dû : ${fcfa(due)}` : "Payé intégralement"}
                  </span>
                  <span className="text-slate-400">Bénéfice {fcfa(s.qty * (s.unitPrice - s.unitCost))}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
      {list.length > 0 && (
        <PrintOrCopy
          printKey="historique-detail"
          getText={() =>
            `Historique des ventes au détail — Multivers'Eau\n\n` +
            list
              .map((s) => {
                const p = productsById[s.productId];
                return `${s.date} — ${s.client} — ${p?.brand} ${p?.format} (u.) × ${s.qty} : ${fcfa(s.qty * s.unitPrice)}`;
              })
              .join("\n")
          }
        />
      )}
      </div>

      <div data-print-section="historique-ouvertures">
      <Card>
        <SectionTitle icon={Scissors}>Historique des ouvertures de colis</SectionTitle>
        {openingsList.length === 0 && <p className="text-sm text-slate-400">Aucune ouverture enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {openingsList.map((o) => {
            const p = productsById[o.productId];
            const detailLot = (data.lots[o.productId]?.detail || []).find((l) => l.id === o.lotId);
            const isBlocked = detailLot && detailLot.qty !== detailLot.originalQty;
            return (
              <li key={o.id} className="py-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {new Date(o.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {p?.brand} {p?.format} ouvert (+{p?.units} u.)
                  </span>
                  <ConfirmDeleteButton
                    onConfirm={() => onDeleteOpening(o.id)}
                    label="Annuler cette ouverture ? Impossible si des unités ont déjà été vendues dessus."
                  />
                </div>
                {isBlocked && detailLot && (
                  <div className="flex justify-end mt-1">
                    <ConfirmDeleteButton
                      size={11}
                      triggerText="Arrêter le suivi"
                      confirmText="Arrêter le suivi"
                      onConfirm={() => onForceCloseOpening(o.id)}
                      label={`Arrêter le suivi de cette ouverture ? Les ${detailLot.qty} unité(s) restante(s) resteront en stock détail, normalement vendables — rien n'est perdu. Cette ligne disparaît juste du suivi "colis ouverts en cours".`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      {openingsList.length > 0 && (
        <PrintOrCopy
          printKey="historique-ouvertures"
          getText={() =>
            `Historique des ouvertures de colis — Multivers'Eau\n\n` +
            openingsList
              .map((o) => {
                const p = productsById[o.productId];
                return `${o.date} — ${p?.brand} ${p?.format} ouvert (+${p?.units} u.)`;
              })
              .join("\n")
          }
        />
      )}
      </div>
    </div>
  );
}

/* -------------------------------- Clients --------------------------------- */

function ClientsTab({ data, totals, onPaySale, onPayDetail, onDeletePayment, onResetPayments }) {
  const [payFor, setPayFor] = useState(null); // {kind, id, max}
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const daysBetween = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 86400000);

  const debts = useMemo(() => {
    const map = {};
    const push = (o, kind) => {
      const due = o.qty * o.unitPrice - o.paidAmount;
      if (due <= 0) return;
      if (!map[o.client]) map[o.client] = { client: o.client, total: 0, items: [] };
      map[o.client].total += due;
      map[o.client].items.push({ ...o, kind, due });
    };
    data.sales.forEach((s) => push(s, "sales"));
    data.detailSales.forEach((s) => push(s, "detailSales"));
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [data]);

  const totalDebt = debts.reduce((s, d) => s + d.total, 0);

  // Classement de fiabilité : pour chaque client, le délai moyen (en jours)
  // entre la date d'achat à crédit et la date où il règle — pour repérer
  // d'un coup d'œil les clients sérieux qui payent vite.
  const reliability = useMemo(() => {
    const map = {};
    const collect = (list) => {
      list.forEach((o) => {
        if (o.mode !== "credit" || !o.payments) return;
        o.payments.forEach((p) => {
          if (!map[o.client]) map[o.client] = { client: o.client, delays: [] };
          map[o.client].delays.push(daysBetween(o.date, p.date));
        });
      });
    };
    collect(data.sales);
    collect(data.detailSales);
    return Object.values(map)
      .map((c) => ({ ...c, avgDays: Math.round(c.delays.reduce((s, d) => s + d, 0) / c.delays.length), count: c.delays.length }))
      .sort((a, b) => a.avgDays - b.avgDays);
  }, [data.sales, data.detailSales]);

  // Créances soldées récemment : ventes à crédit désormais entièrement
  // payées, avec la date du dernier versement qui les a soldées.
  const settledDebts = useMemo(() => {
    const items = [];
    const collect = (list, kind) => {
      list.forEach((o) => {
        if (o.mode !== "credit" || !o.payments || o.payments.length === 0) return;
        const due = o.qty * o.unitPrice - o.paidAmount;
        if (due > 0) return;
        const lastPayment = [...o.payments].sort((a, b) => b.date.localeCompare(a.date))[0];
        items.push({
          id: o.id,
          client: o.client,
          kind,
          amount: o.qty * o.unitPrice,
          purchaseDate: o.date,
          settledDate: lastPayment.date,
          delay: daysBetween(o.date, lastPayment.date),
        });
      });
    };
    collect(data.sales, "sales");
    collect(data.detailSales, "detailSales");
    return items.sort((a, b) => b.settledDate.localeCompare(a.settledDate)).slice(0, 10);
  }, [data.sales, data.detailSales]);

  // Base clients : tous les clients ayant déjà acheté, avec leur date de
  // dernier achat — pour relancer ceux qu'on n'a pas revus depuis longtemps.
  const today = todayISO();
  const clientBase = useMemo(() => {
    const map = {};
    totals.allOps.forEach((o) => {
      if (!map[o.client]) map[o.client] = { client: o.client, lastDate: o.date, count: 0, totalSpent: 0 };
      const c = map[o.client];
      c.count += 1;
      c.totalSpent += o.qty * o.unitPrice;
      if (o.date > c.lastDate) c.lastDate = o.date;
    });
    return Object.values(map)
      .filter((c) => c.client.toLowerCase().includes(search.toLowerCase()))
      .map((c) => ({ ...c, daysSince: daysBetween(c.lastDate, today) }))
      .sort((a, b) => b.daysSince - a.daysSince);
  }, [totals.allOps, search, today]);

  const [payDate, setPayDate] = useState(todayISO());

  const confirmPay = () => {
    if (!payFor || !amount) return;
    const amt = Math.min(Number(amount), payFor.max);
    if (payFor.kind === "sales") onPaySale(payFor.id, amt, payDate);
    else onPayDetail(payFor.id, amt, payDate);
    setPayFor(null);
    setAmount("");
    setPayDate(todayISO());
  };

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Clients" />
      <StatCard label="Total des créances clients" value={fcfa(totalDebt)} tone="amber" />
      <div data-print-section="creances-en-cours" className="space-y-3">
      {debts.length === 0 && (
        <Card>
          <p className="text-sm text-slate-400">Aucune créance en cours — tous les clients sont à jour.</p>
        </Card>
      )}
      {debts.map((d) => (
        <Card key={d.client}>
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-sm flex items-center gap-1.5">
              <Users size={14} className="text-amber-600" /> {d.client}
            </div>
            <div className="font-mono font-bold text-amber-600">{fcfa(d.total)}</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {d.items.map((it) => (
              <li key={it.id} className="py-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">
                    Achat du {new Date(it.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {it.kind === "sales" ? "Gros" : "Détail"} —
                    dû {fcfa(it.due)}
                  </span>
                  <button
                    className="text-teal-700 font-semibold flex items-center gap-0.5"
                    onClick={() => setPayFor({ kind: it.kind, id: it.id, max: it.due })}
                  >
                    Encaisser <ChevronRight size={12} />
                  </button>
                </div>
                {it.payments && it.payments.length > 0 && (
                  <div className="text-slate-400 mt-0.5 pl-1">
                    {it.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <span>
                          Encaissé {fcfa(p.amount)} le <b className="text-slate-600">{new Date(p.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</b>
                          {" "}
                          ({daysBetween(it.date, p.date)} j après l'achat)
                        </span>
                        <ConfirmDeleteButton
                          size={11}
                          onConfirm={() => onDeletePayment(it.kind, it.id, p.id)}
                          label={`Annuler ce versement de ${fcfa(p.amount)} et rouvrir la créance d'autant ?`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ))}
      {debts.length > 0 && (
        <PrintOrCopy
          printKey="creances-en-cours"
          getText={() =>
            `Créances en cours — Multivers'Eau\nTotal dû : ${fcfa(totalDebt)}\n\n` +
            debts.map((d) => `${d.client} : ${fcfa(d.total)}`).join("\n")
          }
        />
      )}
      </div>

      {settledDebts.length > 0 && (
        <div data-print-section="creances-soldees">
        <Card>
          <SectionTitle icon={Check}>Créances soldées récemment</SectionTitle>
          <ul className="divide-y divide-slate-100">
            {settledDebts.map((s) => (
              <li key={s.id} className="py-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {s.client} — {s.kind === "sales" ? "Gros" : "Détail"} — {fcfa(s.amount)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-teal-700 font-semibold">{s.delay} j</span>
                    <ConfirmDeleteButton
                      size={12}
                      onConfirm={() => onResetPayments(s.kind, s.id)}
                      label={`Rouvrir cette créance de ${fcfa(s.amount)} pour ${s.client} — comme si elle n'avait jamais été payée ?`}
                    />
                  </div>
                </div>
                <div className="text-slate-400">
                  Acheté le {new Date(s.purchaseDate).toLocaleDateString("fr-FR", { timeZone: "UTC" })} → soldée le{" "}
                  <b className="text-slate-600">{new Date(s.settledDate).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</b>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <PrintOrCopy
          printKey="creances-soldees"
          getText={() =>
            `Créances soldées récemment — Multivers'Eau\n\n` +
            settledDebts
              .map((s) => `${s.client} — ${fcfa(s.amount)} — acheté le ${s.purchaseDate}, soldée le ${s.settledDate} (${s.delay} j)`)
              .join("\n")
          }
        />
        </div>
      )}

      {reliability.length > 0 && (
        <div data-print-section="classement-fiabilite">
        <Card>
          <SectionTitle icon={Users}>Classement — rapidité de paiement</SectionTitle>
          <p className="text-xs text-slate-500 mb-2">
            Délai moyen entre la date d'achat à crédit et la date d'encaissement — du plus rapide (clients sérieux) au plus lent.
          </p>
          <ul className="divide-y divide-slate-100">
            {reliability.map((c, i) => (
              <li key={c.client} className="py-1.5 flex items-center justify-between text-sm">
                <span>
                  <span className="text-slate-400 text-xs mr-1.5">#{i + 1}</span>
                  {c.client}
                  <span className="text-slate-400 text-xs ml-1.5">({c.count} paiement{c.count > 1 ? "s" : ""})</span>
                </span>
                <span
                  className={`font-mono font-semibold ${
                    c.avgDays <= 3 ? "text-teal-700" : c.avgDays <= 14 ? "text-amber-600" : "text-rose-600"
                  }`}
                >
                  {c.avgDays} j en moyenne
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <PrintOrCopy
          printKey="classement-fiabilite"
          getText={() =>
            `Classement — rapidité de paiement — Multivers'Eau\n\n` +
            reliability.map((c, i) => `#${i + 1} ${c.client} : ${c.avgDays} j en moyenne (${c.count} paiement(s))`).join("\n")
          }
        />
        </div>
      )}

      <div data-print-section="base-clients">
      <Card>
        <SectionTitle icon={Users}>Base clients (relance)</SectionTitle>
        <Input placeholder="Rechercher un client…" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2" />
        {clientBase.length === 0 && <p className="text-sm text-slate-400">Aucun client enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {clientBase.map((c) => (
            <li key={c.client} className="py-2 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{c.client}</div>
                <div className="text-xs text-slate-400">
                  {c.count} achat(s) • {fcfa(c.totalSpent)} au total
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{new Date(c.lastDate).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</div>
                <div
                  className={`text-xs font-semibold ${
                    c.daysSince > 60 ? "text-rose-600" : c.daysSince > 30 ? "text-amber-600" : "text-teal-700"
                  }`}
                >
                  {c.daysSince === 0 ? "Aujourd'hui" : `il y a ${c.daysSince} j`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <PrintOrCopy
        printKey="base-clients"
        getText={() =>
          `Base clients — Multivers'Eau\n\n` +
          clientBase.map((c) => `${c.client} : ${c.count} achat(s), ${fcfa(c.totalSpent)} au total, dernier achat le ${c.lastDate}`).join("\n")
        }
      />
      </div>

      {payFor && (
        <Modal onClose={() => setPayFor(null)} title="Encaisser un paiement">
          <p className="text-xs text-slate-500 mb-2">Montant dû : {fcfa(payFor.max)}</p>
          <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="mb-2" />
          <Input type="number" placeholder="Montant reçu" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-2" />
          <Btn onClick={confirmPay} className="w-full">
            <Check size={16} /> Valider l'encaissement
          </Btn>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose}>
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Petit bouton "corbeille" avec confirmation obligatoire avant suppression,
// réutilisé partout dans l'app (ventes, réappros, ouvertures, prêts...).
function ConfirmDeleteButton({ onConfirm, label = "Supprimer cette ligne ?", size = 14, triggerText, confirmText = "Supprimer" }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button onClick={() => setConfirming(true)} className="text-rose-400 shrink-0 flex items-center gap-1" title={triggerText || "Supprimer"}>
        <Trash2 size={size} />
        {triggerText && <span className="text-xs">{triggerText}</span>}
      </button>
      {confirming && (
        <Modal onClose={() => setConfirming(false)} title="Confirmer la suppression">
          <p className="text-sm text-slate-600 mb-3">{label}</p>
          <div className="grid grid-cols-2 gap-2">
            <Btn kind="ghost" onClick={() => setConfirming(false)}>
              Annuler
            </Btn>
            <Btn
              kind="danger"
              onClick={() => {
                onConfirm();
                setConfirming(false);
              }}
            >
              <Trash2 size={14} /> {confirmText}
            </Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

// Certains navigateurs mobiles (webviews intégrées, certains Android) ne
// déclenchent aucune boîte d'impression avec window.print() sans le
// signaler. On tente quand même, mais on propose toujours en plus une copie
// texte garantie (à coller dans WhatsApp, Notes, etc.), qui elle fonctionne
// partout.
function PrintOrCopy({ getText, className = "", printKey }) {
  const [status, setStatus] = useState(null); // "printing" | "copied" | "error"

  const tryPrint = () => {
    if (typeof window.print !== "function") {
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
      return;
    }
    const cleanup = () => {
      document.body.removeAttribute("data-print-only");
      document.querySelectorAll("[data-print-section]").forEach((el) => el.classList.remove("print-target-active"));
    };
    try {
      if (printKey) {
        const el = document.querySelector(`[data-print-section="${printKey}"]`);
        if (el) {
          el.classList.add("print-target-active");
          document.body.setAttribute("data-print-only", "1");
        }
      }
      window.print();
      window.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 3000); // filet de sécurité si "afterprint" ne se déclenche pas
    } catch (e) {
      cleanup();
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setStatus("copied");
    } catch (e) {
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-2">
        <Btn kind="ghost" onClick={tryPrint}>
          <Printer size={14} /> Imprimer
        </Btn>
        <Btn kind="ghost" onClick={copyText}>
          <Check size={14} /> Copier
        </Btn>
      </div>
      {status === "copied" && <p className="text-xs text-teal-700 mt-1">Copié ! Colle-le dans WhatsApp, Notes, etc.</p>}
      {status === "unsupported" && (
        <p className="text-xs text-amber-600 mt-1">
          L'impression ne répond pas sur ce navigateur — utilise "Copier" à la place, ou réessaie depuis Chrome/Brave (pas depuis une
          app intégrée).
        </p>
      )}
      {status === "error" && <p className="text-xs text-rose-600 mt-1">Copie impossible ici — réessaie depuis Chrome ou Brave.</p>}
    </div>
  );
}

// Bouton d'impression seule, sans "Copier" — pour les sections où copier du
// texte n'a pas de sens (un graphique par exemple). Utilise le même
// mécanisme de "n'imprimer que cette section" que PrintOrCopy.
function ScopedPrintButton({ printKey, label = "Imprimer ce graphique" }) {
  const [status, setStatus] = useState(null);
  const tryPrint = () => {
    if (typeof window.print !== "function") {
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
      return;
    }
    const cleanup = () => {
      document.body.removeAttribute("data-print-only");
      document.querySelectorAll("[data-print-section]").forEach((el) => el.classList.remove("print-target-active"));
    };
    try {
      const el = document.querySelector(`[data-print-section="${printKey}"]`);
      if (el) {
        el.classList.add("print-target-active");
        document.body.setAttribute("data-print-only", "1");
      }
      window.print();
      window.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 3000);
    } catch (e) {
      cleanup();
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
    }
  };
  return (
    <div>
      <Btn kind="ghost" onClick={tryPrint} className="w-full">
        <Printer size={14} /> {label}
      </Btn>
      {status === "unsupported" && (
        <p className="text-xs text-amber-600 mt-1">L'impression ne répond pas sur ce navigateur — réessaie depuis Chrome ou Brave.</p>
      )}
    </div>
  );
}

// Imprime tout l'onglet en cours, sans se limiter à une seule section —
// nettoie d'abord tout ciblage de section resté actif (au cas où), pour
// garantir un vrai print complet.
function PrintWholeTab({ label = "Imprimer tout l'onglet" }) {
  const [status, setStatus] = useState(null);
  const tryPrint = () => {
    document.body.removeAttribute("data-print-only");
    document.querySelectorAll(".print-target-active").forEach((el) => el.classList.remove("print-target-active"));
    if (typeof window.print !== "function") {
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
      return;
    }
    try {
      window.print();
    } catch (e) {
      setStatus("unsupported");
      setTimeout(() => setStatus(null), 3500);
    }
  };
  return (
    <div className="no-print">
      <Btn kind="ghost" onClick={tryPrint} className="w-full">
        <Printer size={14} /> {label}
      </Btn>
      {status === "unsupported" && (
        <p className="text-xs text-amber-600 mt-1">L'impression ne répond pas sur ce navigateur — réessaie depuis Chrome ou Brave.</p>
      )}
    </div>
  );
}


function ShareOrCopy({ getText, title = "Multivers'Eau", className = "" }) {
  const [status, setStatus] = useState(null);

  const share = async () => {
    const text = getText();
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return; // l'utilisateur a annulé, rien à signaler
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (e) {
      setStatus("error");
    }
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <div className={className}>
      <Btn kind="ghost" onClick={share} className="w-full">
        <Recycle size={14} /> Partager
      </Btn>
      {status === "copied" && <p className="text-xs text-teal-700 mt-1">Copié ! Colle-le dans WhatsApp, Notes, etc.</p>}
      {status === "error" && <p className="text-xs text-rose-600 mt-1">Partage indisponible ici — réessaie depuis Chrome ou Brave.</p>}
    </div>
  );
}

/* --------------------------------- Prêts ---------------------------------- */

function LoansTab({ data, onAdd, onRepay, onDelete, onDeleteRepayment }) {
  const [form, setForm] = useState({ date: todayISO(), beneficiary: "", amount: "", note: "", isOpening: false });
  const [repayId, setRepayId] = useState(null);
  const [amt, setAmt] = useState("");
  const [expanded, setExpanded] = useState(null);

  const submit = () => {
    if (!form.beneficiary || !form.amount) return;
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ date: todayISO(), beneficiary: "", amount: "", note: "", isOpening: false });
  };

  const outstanding = data.loans.reduce((s, l) => s + Math.max(0, l.amount - repaidAmount(l)), 0);

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Prêts" />
      <StatCard label="Prêts en cours (à recevoir)" value={fcfa(outstanding)} tone="amber" />
      <Card>
        <SectionTitle icon={HandCoins}>Nouveau prêt effectué</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input placeholder="Bénéficiaire" value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" placeholder="Montant prêté" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input placeholder="Note (optionnel)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-600 mb-2">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={form.isOpening}
            onChange={(e) => setForm({ ...form, isOpening: e.target.checked })}
          />
          <span>
            Ce prêt existait déjà <b>avant le début du suivi</b> (ne déduit pas la trésorerie actuelle, mais compte quand même comme
            actif à recevoir)
          </span>
        </label>
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer le prêt
        </Btn>
      </Card>

      <div data-print-section="prets-en-cours">
      <Card>
        <SectionTitle icon={HandCoins}>Prêts en cours</SectionTitle>
        {data.loans.length === 0 && <p className="text-sm text-slate-400">Aucun prêt enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {data.loans.map((l) => {
            const repaid = repaidAmount(l);
            const due = l.amount - repaid;
            const isOpen = expanded === l.id;
            const repayments = l.repayments || [];
            return (
              <li key={l.id} className="py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium">
                    {l.beneficiary}
                    {l.isOpening && (
                      <span className="ml-1.5 text-xs font-normal text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        prêt de départ
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{new Date(l.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>
                    <ConfirmDeleteButton onConfirm={() => onDelete(l.id)} label={`Supprimer ce prêt à ${l.beneficiary} (${fcfa(l.amount)}) ?`} />
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex justify-between mt-0.5 items-center">
                  <button
                    className="underline decoration-dotted"
                    onClick={() => setExpanded(isOpen ? null : l.id)}
                    disabled={repayments.length === 0}
                  >
                    Prêté {fcfa(l.amount)} • Remboursé {fcfa(repaid)}
                    {repayments.length > 0 ? (isOpen ? " ▲" : " ▼") : ""}
                  </button>
                  {due > 0 ? (
                    <button className="text-teal-700 font-semibold" onClick={() => setRepayId(l.id)}>
                      Solde {fcfa(due)} — encaisser
                    </button>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="text-teal-700 font-semibold">Soldé</span>
                      <ConfirmDeleteButton
                        onConfirm={() => onDelete(l.id)}
                        label={`Supprimer ce prêt soldé (${l.beneficiary}, ${fcfa(l.amount)}) ?`}
                      />
                    </span>
                  )}
                </div>
                {isOpen && repayments.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-2 mt-2 space-y-1">
                    <div className="text-xs text-slate-400 uppercase mb-1">Remboursements enregistrés</div>
                    {repayments.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs py-0.5">
                        <span>{new Date(r.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {fcfa(r.amount)}</span>
                        <ConfirmDeleteButton
                          onConfirm={() => onDeleteRepayment(l.id, r.id)}
                          label={`Supprimer ce remboursement partiel de ${fcfa(r.amount)} ?`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
      {data.loans.length > 0 && (
        <PrintOrCopy
          printKey="prets-en-cours"
          getText={() =>
            `Prêts en cours — Multivers'Eau\nTotal à recevoir : ${fcfa(outstanding)}\n\n` +
            data.loans
              .map((l) => `${l.beneficiary} — Prêté ${fcfa(l.amount)}, Remboursé ${fcfa(repaidAmount(l))}${l.isOpening ? " (prêt de départ)" : ""}`)
              .join("\n")
          }
        />
      )}
      </div>

      {repayId && (
        <Modal onClose={() => setRepayId(null)} title="Enregistrer un remboursement">
          <Input type="number" placeholder="Montant remboursé" value={amt} onChange={(e) => setAmt(e.target.value)} className="mb-2" />
          <Btn
            className="w-full"
            onClick={() => {
              if (amt) onRepay(repayId, Number(amt));
              setRepayId(null);
              setAmt("");
            }}
          >
            <Check size={16} /> Valider
          </Btn>
        </Modal>
      )}
    </div>
  );
}

/* --------------------------------- Stock ----------------------------------- */

function StockTab({ data, productsById, totals, onRestock, onDeleteRestock }) {
  const [brand, setBrand] = useState("VOLTIC");
  const [form, setForm] = useState({ date: todayISO(), productId: "", qty: 1, unitCost: "", updateReference: true });
  const [expanded, setExpanded] = useState(null);

  const options = productOptions(data.products, brand);
  const onProductChange = (id) => {
    const p = productsById[id];
    setForm((f) => ({ ...f, productId: id, unitCost: p ? p.purchase : "" }));
  };

  const submit = () => {
    if (!form.productId || !form.qty || !form.unitCost) return;
    onRestock({ ...form, qty: Number(form.qty), unitCost: Number(form.unitCost) });
    setForm({ date: todayISO(), productId: "", qty: 1, unitCost: "", updateReference: true });
  };

  const brands = brandsOf(data.products);
  const priceChanged = form.productId && Number(form.unitCost) !== productsById[form.productId]?.purchase;

  // Totaux généraux, toutes marques et tous formats confondus — ce qu'il
  // reste réellement après toutes les ventes déjà enregistrées.
  let grandGros = 0;
  let grandDetail = 0;
  data.products.forEach((p) => {
    grandGros += lotsQty(data.lots[p.id]?.gros);
    grandDetail += lotsQty(data.lots[p.id]?.detail);
  });

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Stock" />
      <div data-print-section="stock-total">
      <Card>
        <SectionTitle icon={Boxes}>Total général — toutes marques</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Colis (gros)</div>
            <div className="font-mono font-bold text-lg">{grandGros}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Unités (détail)</div>
            <div className="font-mono font-bold text-lg">{grandDetail}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-xs text-slate-400 uppercase">Valeur totale</div>
            <div className="font-mono font-bold text-lg">{fcfa(totals.stockValue)}</div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Quantités restantes après toutes les ventes déjà enregistrées (coût au prix réel des lots FIFO).
        </p>
      </Card>
      <PrintOrCopy
        printKey="stock-total"
        getText={() =>
          `Stock — Multivers'Eau\nColis (gros) : ${grandGros}\nUnités (détail) : ${grandDetail}\nValeur totale : ${fcfa(totals.stockValue)}`
        }
      />
      </div>

      <Card>
        <SectionTitle icon={Boxes}>Réapprovisionnement (achat fournisseur)</SectionTitle>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select value={brand} onChange={(v) => { setBrand(v); setForm((f) => ({ ...f, productId: "", unitCost: "" })); }} options={brands.map((b) => ({ value: b, label: b }))} />
          <Select value={form.productId} onChange={onProductChange} options={options} placeholder="Format" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Qté achetée" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          <Input type="number" placeholder="Coût unitaire payé" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
        </div>
        {form.qty && form.unitCost && (
          <div className="text-xs text-slate-500 mb-2">Coût total : <b>{fcfa(form.qty * form.unitCost)}</b> (sortie de trésorerie)</div>
        )}
        {form.productId && (
          <label className="flex items-center gap-2 text-xs text-slate-600 mb-2">
            <input
              type="checkbox"
              checked={form.updateReference}
              onChange={(e) => setForm({ ...form, updateReference: e.target.checked })}
            />
            {priceChanged
              ? `Ce lot devient le nouveau prix d'achat de référence (${fcfa(productsById[form.productId].purchase)} → ${fcfa(form.unitCost)})`
              : "Utiliser ce prix comme référence pour les prochains achats"}
          </label>
        )}
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Ajouter ce lot au stock
        </Btn>
      </Card>

      <div data-print-section="stock-historique">
      <Card>
        <SectionTitle icon={Boxes}>Historique des réappros (30 derniers)</SectionTitle>
        {data.restocks.length === 0 && <p className="text-sm text-slate-400">Aucun réappro enregistré.</p>}
        <ul className="divide-y divide-slate-100">
          {data.restocks.slice(0, 30).map((r) => {
            const p = productsById[r.productId];
            return (
              <li key={r.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(r.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {p?.brand} {p?.format} × {r.qty} à {fcfa(r.unitCost)}
                </span>
                <ConfirmDeleteButton
                  onConfirm={() => onDeleteRestock(r.id)}
                  label="Supprimer ce réappro ? Impossible si ce lot a déjà été partiellement vendu."
                />
              </li>
            );
          })}
        </ul>
      </Card>
      {data.restocks.length > 0 && (
        <PrintOrCopy
          printKey="stock-historique"
          getText={() =>
            `Historique des réappros — Multivers'Eau\n\n` +
            data.restocks
              .slice(0, 30)
              .map((r) => {
                const p = productsById[r.productId];
                return `${r.date} — ${p?.brand} ${p?.format} × ${r.qty} à ${fcfa(r.unitCost)}`;
              })
              .join("\n")
          }
        />
      )}
      </div>

      {brands.map((b) => {
        const c = getBrandColor(b);
        const rows = data.products.filter((p) => p.brand === b);
        const brandGros = rows.reduce((s, p) => s + lotsQty(data.lots[p.id]?.gros), 0);
        const brandDetail = rows.reduce((s, p) => s + lotsQty(data.lots[p.id]?.detail), 0);
        const brandVal = rows.reduce((s, p) => {
          const g = data.lots[p.id]?.gros || [];
          const de = data.lots[p.id]?.detail || [];
          return s + g.reduce((a, l) => a + l.qty * l.unitCost, 0) + de.reduce((a, l) => a + l.qty * l.unitCost, 0);
        }, 0);
        return (
          <div key={b} data-print-section={`stock-${b}`}>
          <Card>
            <div className={`flex items-center gap-2 mb-2`}>
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <h3 className="font-bold text-sm">{b}</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-left">
                  <th className="font-medium pb-1">Format</th>
                  <th className="font-medium pb-1 text-right">Gros</th>
                  <th className="font-medium pb-1 text-right">Détail</th>
                  <th className="font-medium pb-1 text-right">Valeur</th>
                  <th className="font-medium pb-1 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const grosLots = data.lots[p.id]?.gros || [];
                  const detailLots = data.lots[p.id]?.detail || [];
                  const grosQty = lotsQty(grosLots);
                  const detailQty = lotsQty(detailLots);
                  const val = grosLots.reduce((s, l) => s + l.qty * l.unitCost, 0) + detailLots.reduce((s, l) => s + l.qty * l.unitCost, 0);
                  const isOpen = expanded === p.id;
                  return (
                    <Fragment key={p.id}>
                      <tr className="border-t border-slate-100 cursor-pointer" onClick={() => setExpanded(isOpen ? null : p.id)}>
                        <td className="py-1.5">{p.format}</td>
                        <td className="py-1.5 text-right font-mono">{grosQty}</td>
                        <td className="py-1.5 text-right font-mono">{detailQty}</td>
                        <td className="py-1.5 text-right font-mono">{fcfa(val)}</td>
                        <td className="py-1.5 text-right text-slate-300">{isOpen ? "▲" : "▼"}</td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="pb-2">
                            <div className="bg-slate-50 rounded-lg p-2 space-y-2">
                              <div>
                                <div className="text-xs uppercase text-slate-400 mb-1">Lots gros (le plus ancien vendu en premier)</div>
                                {grosLots.length === 0 && <div className="text-slate-400 text-xs">Aucun lot.</div>}
                                {sortLots(grosLots).map((l) => (
                                  <div key={l.id} className="flex justify-between text-xs py-0.5">
                                    <span>Lot #{l.lotNo} — {new Date(l.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {l.qty} u.</span>
                                    <span className="font-mono">{fcfa(l.unitCost)}/u</span>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="text-xs uppercase text-slate-400 mb-1">Lots détail (bouteilles ouvertes)</div>
                                {detailLots.length === 0 && <div className="text-slate-400 text-xs">Aucun lot.</div>}
                                {sortLots(detailLots).map((l) => (
                                  <div key={l.id} className="flex justify-between text-xs py-0.5">
                                    <span>Lot #{l.lotNo} — {new Date(l.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {l.qty} u.</span>
                                    <span className="font-mono">{fcfa(l.unitCost)}/u</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-bold">
                  <td className="py-1.5">Total {b}</td>
                  <td className="py-1.5 text-right font-mono">{brandGros}</td>
                  <td className="py-1.5 text-right font-mono">{brandDetail}</td>
                  <td className="py-1.5 text-right font-mono">{fcfa(brandVal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </Card>
          <PrintOrCopy
            printKey={`stock-${b}`}
            getText={() =>
              `Stock ${b} — Multivers'Eau\n` +
              `Total : Gros ${brandGros}, Détail ${brandDetail}, Valeur ${fcfa(brandVal)}\n\n` +
              rows
                .map((p) => {
                  const g = lotsQty(data.lots[p.id]?.gros);
                  const de = lotsQty(data.lots[p.id]?.detail);
                  return `${p.format} : Gros ${g}, Détail ${de}`;
                })
                .join("\n")
            }
          />
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- Bilan ------------------------------------ */

/* -------------------------------- Dépenses --------------------------------- */

function ExpensesTab({ data, totals, onAdd, onDelete }) {
  const [form, setForm] = useState({ date: todayISO(), category: EXPENSE_CATEGORIES[0], label: "", amount: "" });

  const submit = () => {
    if (!form.amount) return;
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ date: todayISO(), category: EXPENSE_CATEGORIES[0], label: "", amount: "" });
  };

  const monthTotal = data.expenses
    .filter((e) => e.date.slice(0, 7) === todayISO().slice(0, 7))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Dépenses" />
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Dépenses ce mois-ci" value={fcfa(monthTotal)} tone="amber" />
        <StatCard label="Total cumulé" value={fcfa(totals.expensesTotal)} tone="amber" />
      </div>

      <Card>
        <SectionTitle icon={Receipt}>Nouvelle dépense</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Une dépense payée tout de suite sort directement de la trésorerie — ce n'est pas un passif. Si elle n'est pas encore payée,
          déclare-la plutôt comme "Passif" dans l'onglet Bilan, puis enregistre-la ici seulement le jour où tu la payes réellement.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Détail (optionnel)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <Input type="number" placeholder="Montant" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <Btn onClick={submit} className="w-full">
          <Plus size={16} /> Enregistrer la dépense
        </Btn>
      </Card>

      <div data-print-section="historique-depenses">
      <Card>
        <SectionTitle icon={Receipt}>Historique des dépenses</SectionTitle>
        {data.expenses.length === 0 && <p className="text-sm text-slate-400">Aucune dépense enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {data.expenses.map((e) => (
            <li key={e.id} className="py-2 text-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="font-medium">
                  {e.category}
                  {e.label ? <span className="text-slate-400 font-normal"> — {e.label}</span> : null}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })}</span>
                  <ConfirmDeleteButton onConfirm={() => onDelete(e.id)} label={`Supprimer cette dépense (${e.category}, ${fcfa(e.amount)}) ?`} />
                </span>
              </div>
              <div className="text-xs font-mono text-slate-600 mt-0.5">{fcfa(e.amount)}</div>
            </li>
          ))}
        </ul>
      </Card>
      {data.expenses.length > 0 && (
        <PrintOrCopy
          printKey="historique-depenses"
          getText={() =>
            `Dépenses — Multivers'Eau\nCe mois-ci : ${fcfa(monthTotal)}\nTotal cumulé : ${fcfa(totals.expensesTotal)}\n\n` +
            data.expenses.map((e) => `${e.date} — ${e.category}${e.label ? " (" + e.label + ")" : ""} : ${fcfa(e.amount)}`).join("\n")
          }
        />
      )}
      </div>
    </div>
  );
}


/* -------------------------------- Recyclage --------------------------------- */

function RecyclingTab({ data, totals, productsById, onAddCollection, onDeleteCollection, onAddSale, onDeleteSale }) {
  const brands = brandsOf(data.products);
  const [colBrand, setColBrand] = useState(brands[0] || "");
  const [colForm, setColForm] = useState({ date: todayISO(), client: "", productId: "", quantity: 1, unitCost: "", note: "" });
  const [saleBrand, setSaleBrand] = useState(brands[0] || "");
  const [saleForm, setSaleForm] = useState({ date: todayISO(), buyer: "", productId: "", quantity: 1, unitPrice: "", note: "" });

  // Stock de bouteilles vides rachetées à l'unité, regroupé par marque +
  // contenance (pas par article exact) — que la bouteille provienne d'un
  // carton, d'un pack ou d'une bouteille seule, elle rejoint le même total
  // dès qu'elle fait la même contenance pour la même marque.
  const stockByBucket = useMemo(() => {
    const map = {};
    (data.recyclingCollections || []).forEach((c) => {
      const p = productsById[c.productId];
      const key = p ? capacityKey(p) : "?";
      map[key] = (map[key] || 0) + c.quantity;
    });
    (data.recyclingSales || []).forEach((s) => {
      const p = productsById[s.productId];
      const key = p ? capacityKey(p) : "?";
      map[key] = (map[key] || 0) - s.quantity;
    });
    return map;
  }, [data.recyclingCollections, data.recyclingSales, productsById]);

  const bucketLabel = (key) => {
    if (key === "?") return "Non spécifié";
    const [brand, cap] = key.split("::");
    return `${brand} ${cap}L`;
  };

  const productLabel = (id) => {
    const p = productsById[id];
    if (!p) return "Article non spécifié";
    const cap = capacityOf(p);
    return `${p.brand} — ${cap ? cap + "L" : p.format}`;
  };

  const submitCollection = () => {
    if (!colForm.productId || !colForm.quantity) return;
    onAddCollection({ ...colForm, quantity: Number(colForm.quantity), unitCost: Number(colForm.unitCost) || 0 });
    setColForm({ date: todayISO(), client: "", productId: "", quantity: 1, unitCost: "", note: "" });
  };

  const submitSale = () => {
    if (!saleForm.productId || !saleForm.quantity || !saleForm.unitPrice) return;
    const ok = onAddSale({ ...saleForm, quantity: Number(saleForm.quantity), unitPrice: Number(saleForm.unitPrice) });
    if (ok) setSaleForm({ date: todayISO(), buyer: "", productId: "", quantity: 1, unitPrice: "", note: "" });
  };

  const colOptions = capacityOptionsFor(data.products, colBrand);
  const saleOptions = capacityOptionsFor(data.products, saleBrand);
  const saleAvailable = saleForm.productId && productsById[saleForm.productId]
    ? stockByBucket[capacityKey(productsById[saleForm.productId])] || 0
    : 0;
  const collectionCost = (data.recyclingCollections || []).reduce((s, c) => s + c.quantity * (c.unitCost || 0), 0);
  const netMargin = totals.recyclingRevenue - collectionCost;

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Recyclage" />
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Bouteilles vides en stock" value={totals.recyclingStock} />
        <StatCard label="Revenu recyclage cumulé" value={fcfa(totals.recyclingRevenue)} tone="teal" />
        <StatCard label="Coût des bouteilles rachetées" value={fcfa(collectionCost)} tone="amber" />
        <StatCard label="Marge nette recyclage" value={fcfa(netMargin)} tone={netMargin >= 0 ? "teal" : "rose"} />
      </div>

      <div data-print-section="stock-contenance">
      <Card>
        <SectionTitle icon={Recycle}>Stock disponible par contenance</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Rachetées à l'unité — carton, pack ou bouteille seule, peu importe l'emballage d'origine : ce qui compte, c'est la marque et
          la contenance.
        </p>
        {Object.entries(stockByBucket).filter(([, q]) => q !== 0).length === 0 && (
          <p className="text-sm text-slate-400">Aucun stock pour l'instant.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {Object.entries(stockByBucket)
            .filter(([, q]) => q !== 0)
            .map(([key, q]) => (
              <li key={key} className="py-1.5 flex justify-between text-sm">
                <span>{bucketLabel(key)}</span>
                <span className="font-mono font-semibold">{q}</span>
              </li>
            ))}
        </ul>
      </Card>
      <PrintOrCopy
        printKey="stock-contenance"
        getText={() =>
          `Recyclage — Stock par contenance — Multivers'Eau\n` +
          `Bouteilles collectées : ${totals.recyclingCollected}\nBouteilles vendues : ${totals.recyclingSoldQty}\n` +
          `Stock actuel : ${totals.recyclingStock}\nRevenu cumulé : ${fcfa(totals.recyclingRevenue)}\n` +
          `Coût des rachats : ${fcfa(collectionCost)}\nMarge nette : ${fcfa(netMargin)}\n\n` +
          Object.entries(stockByBucket)
            .filter(([, q]) => q !== 0)
            .map(([key, q]) => `${bucketLabel(key)} : ${q}`)
            .join("\n")
        }
      />
      </div>

      <Card>
        <SectionTitle icon={Recycle}>Collecte de bouteilles vides</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Le plus souvent gratuite (le client te les donne). Si tu payes le client pour ses bouteilles, indique le prix payé par
          bouteille ci-dessous : ça enregistre automatiquement une dépense correspondante dans l'onglet Dépenses.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={colForm.date} onChange={(e) => setColForm({ ...colForm, date: e.target.value })} />
          <Input placeholder="Client (optionnel)" value={colForm.client} onChange={(e) => setColForm({ ...colForm, client: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select value={colBrand} onChange={(v) => { setColBrand(v); setColForm({ ...colForm, productId: "" }); }} options={brands.map((b) => ({ value: b, label: b }))} />
          <div className="col-span-2">
            <Select value={colForm.productId} onChange={(v) => setColForm({ ...colForm, productId: v })} options={colOptions} placeholder="Contenance" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Quantité (unités)" value={colForm.quantity} onChange={(e) => setColForm({ ...colForm, quantity: e.target.value })} />
          <Input type="number" min="0" placeholder="Prix payé/bouteille (0 = gratuit)" value={colForm.unitCost} onChange={(e) => setColForm({ ...colForm, unitCost: e.target.value })} />
        </div>
        <Input placeholder="Note (optionnel)" value={colForm.note} onChange={(e) => setColForm({ ...colForm, note: e.target.value })} className="mb-2" />
        {colForm.quantity && Number(colForm.unitCost) > 0 && (
          <div className="text-xs text-amber-600 mb-2">
            Dépense générée : <b>{fcfa(colForm.quantity * colForm.unitCost)}</b>
          </div>
        )}
        <Btn onClick={submitCollection} className="w-full">
          <Plus size={16} /> Enregistrer la collecte
        </Btn>
      </Card>

      <Card>
        <SectionTitle icon={Recycle}>Vente des bouteilles collectées</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">Coût nul (collecte gratuite), donc tout ce que tu encaisses ici est du bénéfice pur.</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="date" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} />
          <Input placeholder="Acheteur" value={saleForm.buyer} onChange={(e) => setSaleForm({ ...saleForm, buyer: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Select value={saleBrand} onChange={(v) => { setSaleBrand(v); setSaleForm({ ...saleForm, productId: "" }); }} options={brands.map((b) => ({ value: b, label: b }))} />
          <div className="col-span-2">
            <Select value={saleForm.productId} onChange={(v) => setSaleForm({ ...saleForm, productId: v })} options={saleOptions} placeholder="Contenance" />
          </div>
        </div>
        {saleForm.productId && (
          <div className="text-xs text-slate-500 mb-2">
            Stock disponible pour cette contenance : <b>{saleAvailable}</b> bouteille(s)
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input type="number" min="1" placeholder="Quantité vendue" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} />
          <Input type="number" placeholder="Prix unitaire" value={saleForm.unitPrice} onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })} />
        </div>
        {saleForm.quantity && saleForm.unitPrice && (
          <div className="text-xs text-slate-500 mb-2">
            Total : <b className="text-teal-700">{fcfa(saleForm.quantity * saleForm.unitPrice)}</b>
          </div>
        )}
        <Btn onClick={submitSale} className="w-full">
          <Plus size={16} /> Enregistrer la vente
        </Btn>
      </Card>

      <div data-print-section="historique-collectes">
      <Card>
        <SectionTitle icon={Recycle}>Historique des collectes</SectionTitle>
        {data.recyclingCollections.length === 0 && <p className="text-sm text-slate-400">Aucune collecte enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {data.recyclingCollections.map((c) => (
            <li key={c.id} className="py-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {new Date(c.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {productLabel(c.productId)} — {c.client || "Client anonyme"} :{" "}
                {c.quantity} bouteille(s)
                {c.unitCost > 0 ? ` — payé ${fcfa(c.quantity * c.unitCost)}` : " (gratuit)"}
                {c.note ? ` (${c.note})` : ""}
              </span>
              <ConfirmDeleteButton onConfirm={() => onDeleteCollection(c.id)} label={`Supprimer cette collecte de ${c.quantity} bouteille(s) ?`} />
            </li>
          ))}
        </ul>
      </Card>
      {data.recyclingCollections.length > 0 && (
        <PrintOrCopy
          printKey="historique-collectes"
          getText={() =>
            `Historique des collectes — Multivers'Eau\n\n` +
            data.recyclingCollections
              .map((c) => `${c.date} — ${productLabel(c.productId)} — ${c.client || "Client anonyme"} : ${c.quantity} bouteille(s)${c.unitCost > 0 ? " — payé " + fcfa(c.quantity * c.unitCost) : " (gratuit)"}`)
              .join("\n")
          }
        />
      )}
      </div>

      <div data-print-section="historique-ventes-recyclage">
      <Card>
        <SectionTitle icon={Recycle}>Historique des ventes</SectionTitle>
        {data.recyclingSales.length === 0 && <p className="text-sm text-slate-400">Aucune vente enregistrée.</p>}
        <ul className="divide-y divide-slate-100">
          {data.recyclingSales.map((s) => (
            <li key={s.id} className="py-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {new Date(s.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {productLabel(s.productId)} — {s.buyer || "Acheteur"} : {s.quantity} ×{" "}
                {fcfa(s.unitPrice)} = {fcfa(s.quantity * s.unitPrice)}
              </span>
              <ConfirmDeleteButton onConfirm={() => onDeleteSale(s.id)} label={`Supprimer cette vente (${fcfa(s.quantity * s.unitPrice)}) ?`} />
            </li>
          ))}
        </ul>
      </Card>
      {data.recyclingSales.length > 0 && (
        <PrintOrCopy
          printKey="historique-ventes-recyclage"
          getText={() =>
            `Historique des ventes de recyclage — Multivers'Eau\n\n` +
            data.recyclingSales
              .map((s) => `${s.date} — ${productLabel(s.productId)} — ${s.buyer || "Acheteur"} : ${s.quantity} × ${fcfa(s.unitPrice)} = ${fcfa(s.quantity * s.unitPrice)}`)
              .join("\n")
          }
        />
      )}
      </div>
    </div>
  );
}

function BalanceTab({
  data,
  totals,
  onSetCash,
  onSetStartingCapital,
  onAddLiability,
  onRemoveLiability,
  onAddWithdrawal,
  onDeleteWithdrawal,
  onAddPersonalNote,
  onDeletePersonalNote,
}) {
  const [cash, setCash] = useState(data.meta.initialCash);
  const [capital, setCapital] = useState(data.meta.startingCapital || 0);
  const [liab, setLiab] = useState({ date: todayISO(), label: "", amount: "" });
  const [withdrawal, setWithdrawal] = useState({ date: todayISO(), amount: "", note: "" });
  const [note, setNote] = useState({ date: todayISO(), label: "", amount: "" });

  const submitLiab = () => {
    if (!liab.label || !liab.amount) return;
    onAddLiability({ ...liab, amount: Number(liab.amount) });
    setLiab({ date: todayISO(), label: "", amount: "" });
  };

  const submitWithdrawal = () => {
    if (!withdrawal.amount) return;
    onAddWithdrawal({ ...withdrawal, amount: Number(withdrawal.amount) });
    setWithdrawal({ date: todayISO(), amount: "", note: "" });
  };

  const submitNote = () => {
    if (!note.label || !note.amount) return;
    onAddPersonalNote({ ...note, amount: Number(note.amount) });
    setNote({ date: todayISO(), label: "", amount: "" });
  };

  return (
    <div className="space-y-3">
      <PrintWholeTab label="Imprimer tout l'onglet Bilan" />
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Total actifs" value={fcfa(totals.assets)} />
        <StatCard
          label="Valeur nette (capital)"
          value={fcfa(totals.netWorth)}
          tone={totals.netWorth >= 0 ? "teal" : "rose"}
        />
      </div>

      <div data-print-section="objectif">
      <Card>
        <SectionTitle icon={PiggyBank}>Objectif — dette envers l'investisseur</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Tant que la valeur nette du business n'a pas atteint ce montant, tu n'es pas encore en excédent réel — tout va d'abord au
          remboursement de la dette (et aux besoins de la famille, pas de salaire de gérant pour l'instant).
        </p>
        <Row label="Montant à atteindre (prêt investisseur)" value={fcfa(totals.startingCapital)} />
        <Row label="Valeur nette actuelle" value={fcfa(totals.netWorth)} />
        <ProgressBar value={totals.netWorth} target={totals.startingCapital} />
        <Row
          label={totals.netResult >= 0 ? "Excédent réel (au-delà de la dette)" : "Reste à générer avant excédent"}
          value={fcfa(Math.abs(totals.netResult))}
          bold
          tone={totals.netResult >= 0 ? "teal" : "rose"}
        />
        <div className="flex gap-2 mt-2">
          <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Montant du prêt (ex: 1000000)" />
          <Btn onClick={() => onSetStartingCapital(Number(capital) || 0)}>
            <Check size={16} /> Mettre à jour
          </Btn>
        </div>
      </Card>
      <PrintOrCopy
        printKey="objectif"
        getText={() =>
          `Objectif — dette investisseur — Multivers'Eau\n` +
          `Montant à atteindre : ${fcfa(totals.startingCapital)}\nValeur nette actuelle : ${fcfa(totals.netWorth)}\n` +
          `${totals.netResult >= 0 ? "Excédent réel" : "Reste à générer"} : ${fcfa(Math.abs(totals.netResult))}`
        }
      />
      </div>

      <div data-print-section="remuneration-gerant">
      <Card>
        <SectionTitle icon={HandCoins}>Rémunération du gérant</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Ce que tu prélèves pour ta gestion, distinct du capital de l'actionnaire. Chaque retrait sort de la trésorerie et vient en
          déduction du résultat qui revient à l'actionnaire.
        </p>
        <StatCard label="Total versé à ce jour" value={fcfa(totals.withdrawalsTotal)} tone="amber" />
        {data.withdrawals.length > 0 && (
          <ul className="divide-y divide-slate-100 my-2">
            {data.withdrawals.map((w) => (
              <li key={w.id} className="py-1.5 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(w.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} — {fcfa(w.amount)}
                  {w.note ? ` (${w.note})` : ""}
                </span>
                <ConfirmDeleteButton onConfirm={() => onDeleteWithdrawal(w.id)} label={`Supprimer ce retrait de ${fcfa(w.amount)} ?`} />
              </li>
            ))}
          </ul>
        )}
        <div className="grid grid-cols-2 gap-2 mb-2 mt-2">
          <Input type="date" value={withdrawal.date} onChange={(e) => setWithdrawal({ ...withdrawal, date: e.target.value })} />
          <Input type="number" placeholder="Montant" value={withdrawal.amount} onChange={(e) => setWithdrawal({ ...withdrawal, amount: e.target.value })} />
        </div>
        <Input placeholder="Note (optionnel)" value={withdrawal.note} onChange={(e) => setWithdrawal({ ...withdrawal, note: e.target.value })} className="mb-2" />
        <Btn onClick={submitWithdrawal} className="w-full" kind="ghost">
          <Plus size={16} /> Enregistrer un retrait
        </Btn>
      </Card>
      <PrintOrCopy
        printKey="remuneration-gerant"
        getText={() =>
          `Rémunération du gérant — Multivers'Eau\nTotal versé : ${fcfa(totals.withdrawalsTotal)}\n\n` +
          data.withdrawals.map((w) => `${w.date} : ${fcfa(w.amount)}${w.note ? " (" + w.note + ")" : ""}`).join("\n")
        }
      />
      </div>

      <div data-print-section="tresorerie-depart">
      <Card>
        <SectionTitle icon={Wallet}>Trésorerie de départ</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Montant en caisse au {new Date(data.meta.startDate).toLocaleDateString("fr-FR", { timeZone: "UTC" })} (avant toute vente enregistrée ici).
        </p>
        <div className="flex gap-2">
          <Input type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
          <Btn onClick={() => onSetCash(Number(cash) || 0)}>
            <Check size={16} /> Mettre à jour
          </Btn>
        </div>
      </Card>
      <PrintOrCopy
        printKey="tresorerie-depart"
        getText={() => `Trésorerie de départ — Multivers'Eau\nMontant : ${fcfa(data.meta.initialCash)} (au ${data.meta.startDate})`}
      />
      </div>

      <div data-print-section="actifs">
      <Card>
        <SectionTitle icon={PiggyBank}>Actifs</SectionTitle>
        <Row label="Trésorerie disponible" value={fcfa(totals.treasury)} />
        <Row label="Valeur du stock (gros + détail)" value={fcfa(totals.stockValue)} />
        <Row label="Créances clients" value={fcfa(totals.receivables)} />
        <Row label="Prêts en cours (à recevoir)" value={fcfa(totals.loansOutstanding)} />
        <Row label="Total actifs" value={fcfa(totals.assets)} bold />
      </Card>
      <PrintOrCopy
        printKey="actifs"
        getText={() =>
          `Actifs — Multivers'Eau\nTrésorerie : ${fcfa(totals.treasury)}\nStock : ${fcfa(totals.stockValue)}\n` +
          `Créances : ${fcfa(totals.receivables)}\nPrêts en cours : ${fcfa(totals.loansOutstanding)}\nTotal actifs : ${fcfa(totals.assets)}`
        }
      />
      </div>

      <div data-print-section="tpu">
      <Card>
        <SectionTitle icon={Receipt}>Provision fiscale — TPU estimée</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          En tant qu'exploitant individuel (CA ≤ 60 M FCFA), c'est la <b>Taxe Professionnelle Unique</b> qui s'applique — pas l'IMF.
          Elle remplace l'IRPP, l'IMF, la patente et la TVA à ce niveau d'activité : 2,5 % du chiffre d'affaires (commerce), avec un
          minimum légal de 20 000 F/an. Calculée ici sur le CA réel de l'année civile en cours, donc elle grossit au fil de l'année —
          c'est une estimation pour t'aider à mettre de côté, à confirmer auprès de l'OTR une fois enregistré.
        </p>
        <Row label="CA de l'année en cours" value={fcfa(totals.year.revenue)} />
        <Row label="Taux appliqué" value="2,5 %" />
        <Row label="TPU estimée à provisionner" value={fcfa(totals.tpuEstimate)} bold tone="amber" />
        <p className="text-xs text-slate-400 mt-2">
          Ce montant est déjà déduit de ta "Valeur nette" ci-dessus, comme une dette à venir envers l'État — même s'il n'a pas encore
          été réellement payé.
        </p>
      </Card>
      <PrintOrCopy
        printKey="tpu"
        getText={() =>
          `Provision fiscale — TPU estimée — Multivers'Eau\nCA de l'année : ${fcfa(totals.year.revenue)}\nTaux : 2,5 %\n` +
          `TPU estimée : ${fcfa(totals.tpuEstimate)}`
        }
      />
      </div>

      <div data-print-section="passifs">
      <Card>
        <SectionTitle icon={AlertCircle}>Passifs (dettes de l'entreprise)</SectionTitle>
        {data.liabilities.length === 0 && <p className="text-sm text-slate-400 mb-2">Aucun passif déclaré.</p>}
        <ul className="divide-y divide-slate-100 mb-2">
          {data.liabilities.map((l) => (
            <li key={l.id} className="py-1.5 flex items-center justify-between text-sm">
              <span>{l.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono">{fcfa(l.amount)}</span>
                <ConfirmDeleteButton onConfirm={() => onRemoveLiability(l.id)} label={`Supprimer ce passif "${l.label}" (${fcfa(l.amount)}) ?`} />
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Intitulé (ex: dette fournisseur)" value={liab.label} onChange={(e) => setLiab({ ...liab, label: e.target.value })} />
          <Input type="number" placeholder="Montant" value={liab.amount} onChange={(e) => setLiab({ ...liab, amount: e.target.value })} />
        </div>
        <Btn onClick={submitLiab} className="w-full" kind="ghost">
          <Plus size={16} /> Ajouter un passif
        </Btn>
      </Card>
      {data.liabilities.length > 0 && (
        <PrintOrCopy
          printKey="passifs"
          getText={() =>
            `Passifs — Multivers'Eau\nTotal : ${fcfa(totals.liabilitiesTotal)}\n\n` +
            data.liabilities.map((l) => `${l.label} : ${fcfa(l.amount)}`).join("\n")
          }
        />
      )}
      </div>

      <div data-print-section="resume">
      <Card>
        <Row label="Total actifs" value={fcfa(totals.assets)} />
        <Row label="Total passifs" value={fcfa(totals.liabilitiesTotal)} />
        <Row label="Provision TPU" value={fcfa(totals.tpuEstimate)} />
        <Row label="Valeur nette (capital)" value={fcfa(totals.netWorth)} bold tone={totals.netWorth >= 0 ? "teal" : "rose"} />
      </Card>
      <PrintOrCopy
        printKey="resume"
        getText={() =>
          `Résumé du Bilan — Multivers'Eau\nTotal actifs : ${fcfa(totals.assets)}\nTotal passifs : ${fcfa(totals.liabilitiesTotal)}\n` +
          `Provision TPU : ${fcfa(totals.tpuEstimate)}\nValeur nette : ${fcfa(totals.netWorth)}`
        }
      />
      </div>

      <div data-print-section="hors-bilan">
      <Card>
        <SectionTitle icon={AlertCircle}>Hors bilan — informations personnelles</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Purement informatif : ces montants n'affectent jamais les totaux du business ci-dessus (ex : ce que tu dois
          personnellement à un tiers, sans lien avec l'activité de l'eau).
        </p>
        {data.personalNotes.length === 0 && <p className="text-sm text-slate-400 mb-2">Aucune note.</p>}
        <ul className="divide-y divide-slate-100 mb-2">
          {data.personalNotes.map((n) => (
            <li key={n.id} className="py-1.5 flex items-center justify-between text-sm">
              <span>
                {n.label}
                <span className="text-slate-400 text-xs ml-1">({new Date(n.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })})</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-slate-600">{fcfa(n.amount)}</span>
                <ConfirmDeleteButton onConfirm={() => onDeletePersonalNote(n.id)} label={`Supprimer cette note "${n.label}" ?`} />
              </span>
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input placeholder="Intitulé (ex: dû à [nom])" value={note.label} onChange={(e) => setNote({ ...note, label: e.target.value })} />
          <Input type="number" placeholder="Montant" value={note.amount} onChange={(e) => setNote({ ...note, amount: e.target.value })} />
        </div>
        <Btn onClick={submitNote} className="w-full" kind="ghost">
          <Plus size={16} /> Ajouter une note
        </Btn>
      </Card>
      {data.personalNotes.length > 0 && (
        <PrintOrCopy
          printKey="hors-bilan"
          getText={() =>
            `Hors bilan — Multivers'Eau\n\n` + data.personalNotes.map((n) => `${n.label} (${n.date}) : ${fcfa(n.amount)}`).join("\n")
          }
        />
      )}
      </div>
    </div>
  );
}

function Row({ label, value, bold, tone }) {
  const toneClass = tone === "rose" ? "text-rose-600" : tone === "teal" ? "text-teal-700" : "text-slate-800";
  return (
    <div className={`flex justify-between py-1.5 text-sm ${bold ? "border-t border-slate-200 mt-1 pt-2" : ""}`}>
      <span className={bold ? "font-bold" : "text-slate-500"}>{label}</span>
      <span className={`font-mono ${bold ? `font-bold ${toneClass}` : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

// Barre de progression vers un objectif (ex : dette à couvrir). Se remplit
// en teal jusqu'à 100%, puis passe en excédent (affiché au-delà de la barre
// via le Row associé).
function ProgressBar({ value, target }) {
  const pct = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;
  const reached = value >= target && target > 0;
  return (
    <div className="my-2">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{pct.toFixed(0)}% atteint</span>
        {reached && <span className="text-teal-700 font-semibold">Objectif atteint 🎉</span>}
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${reached ? "bg-teal-600" : "bg-amber-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------- Paramètres --------------------------------- */

function SettingsTab({ data, onUpdate, onAddProduct, onRestore, onExported, onSetLotSeq, onDeleteLot }) {
  const brands = brandsOf(data.products);
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [lotSeqEdits, setLotSeqEdits] = useState({});
  const [showAllLots, setShowAllLots] = useState(false);
  const [newProduct, setNewProduct] = useState({
    brand: "",
    customBrand: "",
    format: "",
    units: "",
    purchase: "",
    sellPrice: "",
    retailPrice: "",
  });

  const submitNewProduct = () => {
    const brand = newProduct.brand === "__new__" ? newProduct.customBrand : newProduct.brand;
    if (!brand || !newProduct.format || !newProduct.units || !newProduct.purchase || !newProduct.sellPrice) return;
    onAddProduct({ ...newProduct, brand });
    setNewProduct({ brand: "", customBrand: "", format: "", units: "", purchase: "", sellPrice: "", retailPrice: "" });
  };

  const backupJson = () => JSON.stringify(data, null, 2);
  const backupFilename = () => `multivers-eau-sauvegarde-${todayISO()}.json`;

  const exportBackup = async () => {
    const filename = backupFilename();
    const json = backupJson();
    const blob = new Blob([json], { type: "application/json" });

    // 1) Partage natif Android/iOS — le plus fiable depuis une vue intégrée
    // comme celle de Claude, qui bloque parfois les téléchargements directs.
    try {
      const file = new File([blob], filename, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        onExported();
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // l'utilisateur a annulé le partage, rien de cassé
    }

    // 2) Téléchargement classique (fonctionne dans un vrai navigateur)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onExported();
      return;
    } catch (e) {
      // on continue vers le dernier recours
    }

    // 3) Dernier recours : afficher le texte pour copier/coller manuellement
    setShowRaw(true);
  };

  const copyRaw = async () => {
    try {
      await navigator.clipboard.writeText(backupJson());
      setCopied(true);
      onExported();
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  const onFileChosen = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onRestore(reader.result);
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const lastExport = data.meta.lastExportAt ? new Date(data.meta.lastExportAt) : null;
  const daysSinceExport = lastExport ? Math.round((Date.now() - lastExport.getTime()) / 86400000) : null;

  return (
    <div className="space-y-3">
      <Card>
        <SectionTitle icon={Wallet}>Sauvegarde de tes données</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Tes données sont enregistrées automatiquement à chaque action. Par précaution, tu peux aussi exporter un fichier de
          sauvegarde à tout moment, et le réimporter plus tard si besoin (par ex. en cas de problème technique).
        </p>
        <p className={`text-xs mb-2 font-medium ${daysSinceExport === null || daysSinceExport > 3 ? "text-amber-600" : "text-teal-700"}`}>
          {lastExport
            ? `Dernière sauvegarde exportée : ${lastExport.toLocaleDateString("fr-FR", { timeZone: "UTC" })} (il y a ${daysSinceExport} j)`
            : "Aucune sauvegarde exportée pour l'instant — pense à en faire une !"}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={exportBackup} kind="ghost">
            Exporter une sauvegarde
          </Btn>
          <Btn onClick={() => setImporting(true)} kind="ghost">
            Importer une sauvegarde
          </Btn>
        </div>
        <button onClick={() => setShowRaw(true)} className="w-full text-xs text-slate-400 underline mt-2">
          Le téléchargement ne marche pas ? Copier le texte manuellement
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={onFileChosen} />
      </Card>

      {showRaw && (
        <Modal onClose={() => setShowRaw(false)} title="Copier ta sauvegarde">
          <p className="text-xs text-slate-500 mb-2">
            Si le téléchargement ne fonctionne pas sur ton téléphone (fréquent dans les apps comme Claude), copie ce texte et
            colle-le dans tes Notes, ou envoie-le toi-même par message — tu pourras le réimporter plus tard en le collant dans un
            fichier <code>.json</code>.
          </p>
          <textarea
            readOnly
            value={backupJson()}
            onFocus={(e) => e.target.select()}
            className="w-full h-40 text-xs font-mono border border-slate-200 rounded-lg p-2 mb-2"
          />
          <Btn onClick={copyRaw} className="w-full">
            <Check size={16} /> {copied ? "Copié !" : "Copier le texte"}
          </Btn>
        </Modal>
      )}

      {importing && (
        <Modal onClose={() => setImporting(false)} title="Importer une sauvegarde">
          <p className="text-sm text-slate-600 mb-3">
            Attention : ceci va <b>remplacer entièrement</b> les données actuelles de l'application par celles du fichier importé.
            Cette action ne peut pas être annulée.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Btn kind="ghost" onClick={() => setImporting(false)}>
              Annuler
            </Btn>
            <Btn kind="danger" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              Choisir le fichier
            </Btn>
          </div>
          <p className="text-xs text-slate-400 mb-1">Ou colle directement le texte de ta sauvegarde ici :</p>
          <textarea
            placeholder="Colle ici le contenu JSON copié précédemment…"
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            className="w-full h-24 text-xs font-mono border border-slate-200 rounded-lg p-2 mb-2"
          />
          {pastedJson.trim() && (
            <Btn
              kind="danger"
              className="w-full"
              onClick={() => {
                onRestore(pastedJson);
                setPastedJson("");
                setImporting(false);
              }}
            >
              Restaurer ce texte
            </Btn>
          )}
        </Modal>
      )}

      <Card>
        <SectionTitle icon={Plus}>Ajouter un nouvel article</SectionTitle>
        <p className="text-xs text-slate-500 mb-2">
          Une nouvelle marque, un nouveau carton, pack, ou même une bouteille vendue à l'unité — même une contenance que tu ne connais
          pas encore aujourd'hui. Il démarre avec un stock vide ; réapprovisionne-le ensuite normalement depuis l'onglet Stock.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select
            value={newProduct.brand}
            onChange={(v) => setNewProduct({ ...newProduct, brand: v })}
            options={[...brands.map((b) => ({ value: b, label: b })), { value: "__new__", label: "+ Nouvelle marque…" }]}
            placeholder="Marque existante"
          />
          {newProduct.brand === "__new__" ? (
            <Input
              placeholder="Nom de la nouvelle marque"
              value={newProduct.customBrand}
              onChange={(e) => setNewProduct({ ...newProduct, customBrand: e.target.value })}
            />
          ) : (
            <Input
              placeholder="Format (ex: Carton 12x1,5L, Bouteille 1,5L)"
              value={newProduct.format}
              onChange={(e) => setNewProduct({ ...newProduct, format: e.target.value })}
            />
          )}
        </div>
        {newProduct.brand === "__new__" && (
          <Input
            placeholder="Format (ex: Carton 12x1,5L, Bouteille 1,5L)"
            value={newProduct.format}
            onChange={(e) => setNewProduct({ ...newProduct, format: e.target.value })}
            className="mb-2"
          />
        )}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input
            type="number"
            placeholder="Unités par colis (1 si bouteille seule)"
            value={newProduct.units}
            onChange={(e) => setNewProduct({ ...newProduct, units: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Prix d'achat"
            value={newProduct.purchase}
            onChange={(e) => setNewProduct({ ...newProduct, purchase: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input
            type="number"
            placeholder="Prix vente gros"
            value={newProduct.sellPrice}
            onChange={(e) => setNewProduct({ ...newProduct, sellPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Prix vente détail (/u)"
            value={newProduct.retailPrice}
            onChange={(e) => setNewProduct({ ...newProduct, retailPrice: e.target.value })}
          />
        </div>
        <Btn onClick={submitNewProduct} className="w-full">
          <Plus size={16} /> Ajouter au catalogue
        </Btn>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <SectionTitle icon={Boxes}>Registre de tous les lots</SectionTitle>
          <button type="button" onClick={() => setShowAllLots((v) => !v)} className="text-xs font-semibold text-teal-700">
            {showAllLots ? "Masquer" : "Afficher"}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Tous les lots gros et détail, produit par produit. Un lot marqué <b className="text-amber-600">⚠ sans origine</b> n'a aucun
          réappro ni ouverture qui lui correspond — souvent un reste d'un ancien bug. Suppression possible uniquement si rien n'a
          encore été vendu dessus.
        </p>
        {showAllLots && (
          <div className="space-y-3 mt-2">
            {data.products.map((p) => {
              const gros = (data.lots[p.id]?.gros || []).map((l) => ({ ...l, kind: "gros" }));
              const detail = (data.lots[p.id]?.detail || []).map((l) => ({ ...l, kind: "detail" }));
              const all = sortLots([...gros, ...detail]);
              if (all.length === 0) return null;
              return (
                <div key={p.id}>
                  <div className="text-xs font-bold text-slate-600 mb-1">
                    {p.brand} {p.format}
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {all.map((l) => {
                      const isOrphan =
                        !data.restocks.some((r) => r.lotId === l.id) &&
                        !data.openings.some((o) => o.lotId === l.id) &&
                        l.lotNo !== 1; // lotNo 1 = stock de départ, normal de n'avoir aucun réappro/ouverture
                      const untouched = l.qty === l.originalQty;
                      return (
                        <li key={l.id} className="py-1.5 flex items-center justify-between text-xs">
                          <span className="text-slate-600">
                            {l.kind === "gros" ? "Gros" : "Détail"} — Lot #{l.lotNo} — {new Date(l.date).toLocaleDateString("fr-FR", { timeZone: "UTC" })} —{" "}
                            {l.qty}/{l.originalQty}
                            {isOrphan && <span className="text-amber-600 font-semibold"> ⚠ sans origine</span>}
                          </span>
                          {untouched ? (
                            <ConfirmDeleteButton
                              size={12}
                              onConfirm={() => onDeleteLot(p.id, l.kind, l.id)}
                              label={`Supprimer ce lot (${l.kind === "gros" ? "Gros" : "Détail"} #${l.lotNo}, ${l.qty} unité(s)) ? Cette quantité sera retirée du stock.`}
                            />
                          ) : (
                            <span className="text-slate-300" title="Déjà partiellement vendu — suppression impossible">
                              —
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon={Settings}>Prix par article</SectionTitle>
        <p className="text-xs text-slate-500">
          Ces prix ne sont que des <b>valeurs par défaut</b> — modifiables librement au moment de chaque vente. Le "prix d'achat de
          référence" ne change pas le coût des lots déjà en stock (géré en FIFO) ; il sert seulement de valeur pré-remplie pour vos
          prochains réapprovisionnements.
        </p>
      </Card>
      {brands.map((b) => {
        const c = getBrandColor(b);
        const rows = data.products.filter((p) => p.brand === b);
        return (
          <Card key={b}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <h3 className="font-bold text-sm">{b}</h3>
            </div>
            <div className="space-y-2">
              {rows.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-lg p-2">
                  <div className="text-xs font-medium mb-1">{p.format}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs items-center">
                    <div>
                      <label className="text-xs text-slate-400">Achat (référence)</label>
                      <Input type="number" value={p.purchase} onChange={(e) => onUpdate(p.id, { purchase: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Vente gros</label>
                      <Input type="number" value={p.sellPrice} onChange={(e) => onUpdate(p.id, { sellPrice: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Vente détail (/u)</label>
                      <Input type="number" value={p.retailPrice} onChange={(e) => onUpdate(p.id, { retailPrice: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs items-end mt-2 pt-2 border-t border-slate-100">
                    <div className="col-span-2">
                      <label className="text-xs text-slate-400">
                        Compteur de lots (dernier n° utilisé — le prochain sera n°+1)
                      </label>
                      <Input
                        type="number"
                        placeholder={String((data.meta.lotSeqByProduct || {})[p.id] || 0)}
                        value={lotSeqEdits[p.id] ?? ""}
                        onChange={(e) => setLotSeqEdits({ ...lotSeqEdits, [p.id]: e.target.value })}
                      />
                    </div>
                    <Btn
                      kind="ghost"
                      onClick={() => {
                        if (lotSeqEdits[p.id] === undefined || lotSeqEdits[p.id] === "") return;
                        onSetLotSeq(p.id, lotSeqEdits[p.id]);
                        setLotSeqEdits({ ...lotSeqEdits, [p.id]: "" });
                      }}
                    >
                      Régler
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
