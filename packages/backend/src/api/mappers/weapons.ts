import type { Weapon } from '@jrposada/auroria-toolkit-shared/models/weapons/weapon';

import type { WeaponRow } from '../../data/models/weapon.ts';

function toApiWeapon(model: WeaponRow): Weapon {
  return {
    id: model.id,
    name: model.name,
    class: model.classId,
    type: model.type,
    rarity: model.rarity,
    itemLevel: model.itemLevel,
    talentRequirement: model.talentRequirement,
    weight: model.weight,
    physicalAtk: model.physicalAtk,
    magicAtk: model.magicAtk,
    damageShare: model.damageShare,
    staggerTrigger: model.staggerTrigger,
    exhaustTrigger: model.exhaustTrigger,
    lunastone: model.lunastone,
    extraStat: model.extraStat,
    tempering: model.tempering,
    howToGet: model.howToGet,
    notes: model.notes,
    sources: model.sources,
  };
}

export { toApiWeapon };
