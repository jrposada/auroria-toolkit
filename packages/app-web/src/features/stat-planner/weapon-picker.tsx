import { Weapon } from '@shared/models/weapons/weapon';
import {
  CSSProperties,
  FunctionComponent,
  KeyboardEvent,
  useCallback,
  useState,
} from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useMediaQuery } from '../../core/hooks/use-media-query/use-media-query';
import Tooltip from '../../ui/tooltip/tooltip';
import { PlannerForm, Slot, WEAPON_SLOTS } from './planner-form';
import { Plan } from './use-plan';
import styles from './weapon-picker.module.css';
import WeaponTile from './weapon-tile';
import WeaponTooltip from './weapon-tooltip';
import {
  nextTileIndex,
  rarityColor,
  tabStopId,
  tileTap,
  tileView,
} from './weapon-view';

type WeaponPickerProps = {
  slot: Slot;
  plan: Plan;
};

const WeaponPicker: FunctionComponent<WeaponPickerProps> = ({ slot, plan }) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext<PlannerForm>();
  // No hover on touch screens: a tap selects and opens an inline detail instead.
  const coarse = useMediaQuery('(hover: none)');
  const [tip, setTip] = useState<{
    anchor: HTMLElement;
    weapon: Weapon;
  } | null>(null);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const closeTip = useCallback(() => setTip(null), []);

  const field = WEAPON_SLOTS.find((entry) => entry.slot === slot)!.field;
  const weapons = plan.weapons[slot];
  const selected = plan.selected[slot];
  const tabStop = tabStopId(weapons, selected?.id ?? null);
  const groupLabel = t(`stat_planner.weapons.${slot}`);
  const detailId = `weapon-detail-${slot}`;
  const detailWeapon = coarse
    ? (weapons.find((weapon) => weapon.id === openDetailId) ?? null)
    : null;

  const onSelect = (weapon: Weapon) => {
    setValue(field, weapon.id);
    if (coarse) {
      setOpenDetailId((open) => tileTap(weapon.id, open));
    }
  };

  const onShow = (weapon: Weapon, anchor: HTMLElement) => {
    if (!coarse) {
      setTip({ anchor, weapon });
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const tiles = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'),
    ];
    const index = tiles.indexOf(event.target as HTMLElement);
    const next =
      index < 0 ? null : nextTileIndex(event.key, index, tiles.length);

    if (next !== null) {
      // Arrows move focus only; the level shortcuts must not see them.
      event.preventDefault();
      event.stopPropagation();
      tiles[next]?.focus();
    }
  };

  return (
    <div className={styles.picker} data-slot={slot}>
      <div className={styles.head}>
        <h2 className={styles.title}>{groupLabel}</h2>
        {selected && (
          <p className={styles.carried}>
            <span className={styles.carriedName}>{selected.name}</span>
            <span>
              {selected.talentRequirement === null
                ? t('stat_planner.weapons.no_requirement')
                : t('stat_planner.weapons.needs', {
                    requirement: selected.talentRequirement,
                  })}
            </span>
          </p>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={groupLabel}
        className={styles.tiles}
        onKeyDown={onKeyDown}
        onPointerLeave={coarse ? undefined : closeTip}
      >
        {weapons.map((weapon) => {
          const view = tileView(weapon, selected?.id ?? null, plan.current.tal);

          return (
            <WeaponTile
              key={weapon.id}
              weapon={weapon}
              checked={view.checked}
              short={view.short}
              tabStop={weapon.id === tabStop}
              describedBy={
                detailWeapon?.id === weapon.id ? detailId : undefined
              }
              onSelect={onSelect}
              onShow={onShow}
            />
          );
        })}
      </div>

      {detailWeapon && (
        <div
          id={detailId}
          data-weapon-detail
          className={styles.detail}
          style={
            {
              '--tooltip-accent': rarityColor(detailWeapon.rarity),
            } as CSSProperties
          }
        >
          <WeaponTooltip weapon={detailWeapon} plan={plan} />
        </div>
      )}

      {!coarse && (
        <Tooltip
          id={`weapon-tip-${slot}`}
          anchor={tip?.anchor ?? null}
          accent={tip ? rarityColor(tip.weapon.rarity) : undefined}
          onClose={closeTip}
        >
          {tip && <WeaponTooltip weapon={tip.weapon} plan={plan} />}
        </Tooltip>
      )}
    </div>
  );
};

export default WeaponPicker;
