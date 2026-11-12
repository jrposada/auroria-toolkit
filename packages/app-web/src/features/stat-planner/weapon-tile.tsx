import { Weapon } from '@shared/models/weapons/weapon';
import { CSSProperties, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './weapon-tile.module.css';
import { rarityColor } from './weapon-view';

type WeaponTileProps = {
  weapon: Weapon;
  checked: boolean;
  short: boolean;
  tabStop: boolean;
  describedBy?: string;
  onSelect: (weapon: Weapon, element: HTMLButtonElement) => void;
  onShow: (weapon: Weapon, element: HTMLButtonElement) => void;
};

// The reference's two placeholder blades; no game art is used.
const BLADES = {
  Greatsword: 'M9 23 L21 5 L27 5 L27 11 L11 25 Z',
  Longsword: 'M10 22 L24 6 L27 5 L26 8 L12 24 Z',
};

const WeaponTile: FunctionComponent<WeaponTileProps> = ({
  weapon,
  checked,
  short,
  tabStop,
  describedBy,
  onSelect,
  onShow,
}) => {
  const { t } = useTranslation();
  const requirement = weapon.talentRequirement;
  const label = t(
    requirement === null
      ? 'stat_planner.tile.label'
      : 'stat_planner.tile.label_requirement',
    {
      name: weapon.name,
      rarity: weapon.rarity,
      itemLevel: weapon.itemLevel,
      requirement,
    }
  );
  const style = { '--rc': rarityColor(weapon.rarity) } as CSSProperties;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      tabIndex={tabStop ? 0 : -1}
      data-weapon={weapon.id}
      className={styles.tile}
      style={style}
      onClick={(event) => {
        // Safari does not focus a clicked button.
        event.currentTarget.focus();
        onSelect(weapon, event.currentTarget);
      }}
      onPointerEnter={(event) => onShow(weapon, event.currentTarget)}
      onFocus={(event) => onShow(weapon, event.currentTarget)}
    >
      {requirement !== null && (
        <span className={styles.requirement} data-short={short || undefined}>
          {requirement}
        </span>
      )}
      <span className={styles.icon}>
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path
            className={styles.blade}
            d={
              weapon.type === 'Greatsword'
                ? BLADES.Greatsword
                : BLADES.Longsword
            }
          />
          <path className={styles.guard} d="M6 20 L12 26" />
          <path className={styles.grip} d="M8 24 L4 28" />
        </svg>
      </span>
      <span className={styles.name}>{weapon.name}</span>
      <span className={styles.level}>
        {t('stat_planner.tile.item_level', { itemLevel: weapon.itemLevel })}
      </span>
    </button>
  );
};

export default WeaponTile;
