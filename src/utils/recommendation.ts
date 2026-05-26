import type { Bike, UserProfile, ScoredBike } from '../types/bike';

function heightToSize(height: number): string[] {
  if (height < 162) return ['XS', '44', '46'];
  if (height < 170) return ['S', '48', '49', '50'];
  if (height < 178) return ['M', '51', '52', '53', '54'];
  if (height < 186) return ['L', 'ML', '55', '56'];
  return ['XL', '58', '60', '61', '62'];
}

export function scoreBikes(bikes: Bike[], profile: UserProfile): ScoredBike[] {
  const targetSizes = heightToSize(profile.height);

  return bikes.map(bike => {
    let score = 0;
    const reasons: string[] = [];

    // ── Größe (20 Punkte) ────────────────────────────────────────────
    const hasSize = bike.sizes.some(s => targetSizes.some(t => s.includes(t)));
    if (hasSize) {
      score += 20;
      reasons.push('Passende Rahmengröße verfügbar');
    }

    // ── Erfahrung → Schaltgruppe & Preis (25 Punkte) ─────────────────
    const groupLower = bike.groupset.toLowerCase();
    if (profile.experience === 'beginner') {
      if (groupLower.includes('claris') || groupLower.includes('sora')) {
        score += 25; reasons.push('Einsteiger-Schaltgruppe, einfach zu bedienen');
      } else if (groupLower.includes('tiagra') || groupLower.includes('grx 400')) {
        score += 18; reasons.push('Solide Einsteiger-/Mittelklasse-Schaltgruppe');
      } else {
        score += 8;
      }
    } else if (profile.experience === 'intermediate') {
      if (groupLower.includes('tiagra') || groupLower.includes('grx 400')) {
        score += 25; reasons.push('Perfekte Mittelklasse-Schaltgruppe');
      } else if (groupLower.includes('grx 600') || groupLower.includes('grx 810')) {
        score += 22; reasons.push('Hochwertige GRX-Schaltgruppe');
      } else if (groupLower.includes('claris') || groupLower.includes('sora')) {
        score += 10;
      } else {
        score += 15;
      }
    } else {
      // advanced
      if (groupLower.includes('grx 600') || groupLower.includes('grx 810') || groupLower.includes('grx 820')) {
        score += 25; reasons.push('Hochwertige GRX-Schaltgruppe für Fortgeschrittene');
      } else if (groupLower.includes('rival') || groupLower.includes('force') || groupLower.includes('red')) {
        score += 25; reasons.push('Premium SRAM-Schaltgruppe');
      } else {
        score += 8;
      }
    }

    // ── Terrain → Reifenbreite & Laufrad (25 Punkte) ─────────────────
    if (profile.terrain === 'road') {
      if (bike.tireWidth <= 40) {
        score += 25; reasons.push('Schmale Reifen für schnelle Straßenfahrten');
      } else if (bike.tireWidth <= 45) {
        score += 15;
      } else {
        score += 5;
      }
    } else if (profile.terrain === 'mixed') {
      if (bike.tireWidth >= 40 && bike.tireWidth <= 47) {
        score += 25; reasons.push('Optimale Reifenbreite für Straße & Schotter');
      } else if (bike.tireWidth < 40) {
        score += 10;
      } else {
        score += 18;
      }
    } else {
      // offroad
      if (bike.tireWidth >= 47) {
        score += 25; reasons.push('Breite Reifen für Schotter & Trails');
        if (bike.wheelSize === '700c / 650b') {
          score += 5; reasons.push('650b-Option für noch mehr Reifenfreiheit');
        }
      } else if (bike.tireWidth >= 42) {
        score += 15;
      } else {
        score += 5;
      }
    }

    // ── Priorität (15 Punkte) ─────────────────────────────────────────
    if (profile.priority === 'budget') {
      const p = Math.min(...bike.shopLinks.map(s => s.price ?? bike.price));
      if (p <= 600) { score += 15; reasons.push('Sehr günstiger Einstiegspreis'); }
      else if (p <= 900) { score += 10; reasons.push('Gutes Preis-Leistungs-Verhältnis'); }
      else { score += 4; }
    } else if (profile.priority === 'speed') {
      if (bike.weight < 9.5) { score += 15; reasons.push('Leichtes Bike für höheres Tempo'); }
      else if (bike.weight < 10.5) { score += 8; }
      else { score += 2; }
    } else if (profile.priority === 'comfort') {
      if (bike.stack >= 575) { score += 15; reasons.push('Aufrechte Sitzposition, weniger Rückenschmerzen'); }
      else if (bike.stack >= 565) { score += 10; }
      if (bike.tireWidth >= 45) { score += 3; }
    } else {
      // adventure
      if (bike.tireWidth >= 45 && bike.wheelSize !== '700c') {
        score += 15; reasons.push('Geeignet für mehrtägige Touren & Bikepacking');
      } else if (bike.tireWidth >= 40) {
        score += 8;
      }
    }

    // ── Bremsen-Bonus (5 Punkte) ──────────────────────────────────────
    if (bike.brakes === 'Hydraulisch') {
      score += 5; reasons.push('Hydraulische Scheibenbremsen');
    }

    return { ...bike, matchScore: Math.min(score, 100), matchReasons: reasons };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
