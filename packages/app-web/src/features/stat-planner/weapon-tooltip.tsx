import { Weapon } from '@shared/models/weapons/weapon';
import { CSSProperties, FunctionComponent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Plan } from './use-plan';
import styles from './weapon-tooltip.module.css';
import { weaponDetail } from './weapon-view';

type WeaponTooltipProps = {
  weapon: Weapon;
  plan: Plan;
};

type RowProps = {
  label: string;
  children: ReactNode;
  met?: boolean;
  tone?: 'luna';
};

const Row: FunctionComponent<RowProps> = ({ label, children, met, tone }) => {
  return (
    <div className={styles.row}>
      <span className={styles.key}>{label}</span>
      <span
        className={styles.value}
        data-met={met === undefined ? undefined : String(met)}
        data-tone={tone}
      >
        {children}
      </span>
    </div>
  );
};

/** The item card's content; the floating tooltip or the inline panel wraps it. */
const WeaponTooltip: FunctionComponent<WeaponTooltipProps> = ({
  weapon,
  plan,
}) => {
  const { t } = useTranslation();
  const detail = weaponDetail(weapon, plan);
  const style = { '--rc': detail.color } as CSSProperties;
  const { tempering } = detail;

  return (
    <div className={styles.card} style={style}>
      <div className={styles.header}>
        <h3 className={styles.name}>{weapon.name}</h3>
        <p className={styles.kind}>
          {t('stat_planner.tip.kind', {
            rarity: weapon.rarity,
            type: weapon.type,
          })}
        </p>
      </div>

      <div data-section="stats" className={styles.section}>
        <Row label={t('stat_planner.tip.class')}>{plan.cls.name}</Row>
        <Row label={t('stat_planner.tip.item_level')}>{weapon.itemLevel}</Row>
        {detail.physicalAtk !== null && (
          <Row label={t('stat_planner.tip.physical_atk')}>
            {detail.physicalAtk}
          </Row>
        )}
        {detail.magicAtk !== null && (
          <Row label={t('stat_planner.tip.magic_atk')}>{detail.magicAtk}</Row>
        )}
        <div className={styles.row}>
          <span className={styles.key}>
            {t('stat_planner.tip.damage_share')}
          </span>
          <span className={styles.share}>
            <span data-share="physical">
              {t('stat_planner.tip.share_physical', {
                pct: detail.share.physical,
              })}
            </span>
            <span data-share="magic">
              {t('stat_planner.tip.share_magic', { pct: detail.share.magic })}
            </span>
          </span>
        </div>
        <div className={styles.bar} aria-hidden="true">
          <i
            data-share="physical"
            style={{ width: `${detail.share.physicalWidth}%` }}
          />
          <i
            data-share="magic"
            style={{ width: `${detail.share.magicWidth}%` }}
          />
        </div>
        <Row label={t('stat_planner.tip.stagger')}>
          {t('stat_planner.tip.percent', { value: detail.stagger })}
        </Row>
        <Row label={t('stat_planner.tip.exhaust')}>
          {t('stat_planner.tip.percent', { value: detail.exhaust })}
        </Row>
        {detail.extraStat !== null && (
          <Row label={t('stat_planner.tip.bonus')}>{detail.extraStat}</Row>
        )}
        <Row label={t('stat_planner.tip.weight')}>{detail.weight}</Row>
      </div>

      <div data-section="talent" className={styles.section}>
        {detail.talent ? (
          <>
            <Row label={t('stat_planner.tip.requires')} met={detail.talent.met}>
              {t('stat_planner.tip.requires_value', {
                requirement: detail.talent.requirement,
              })}
            </Row>
            <Row
              label={t('stat_planner.tip.your_talent', { level: plan.level })}
              met={detail.talent.met}
            >
              {detail.talent.now}
            </Row>
            <Row label={t('stat_planner.tip.plan_reaches')}>
              {detail.talent.reachedAt === null
                ? t('stat_planner.tip.not_planned')
                : t('stat_planner.tip.reaches_level', {
                    level: detail.talent.reachedAt,
                  })}
            </Row>
          </>
        ) : (
          <Row label={t('stat_planner.tip.requires')} met>
            {t('stat_planner.tip.no_talent')}
          </Row>
        )}
      </div>

      {detail.lunastone !== null && (
        <div data-section="lunastone" className={styles.section}>
          <Row label={t('stat_planner.tip.lunastone')} tone="luna">
            {detail.lunastone}
          </Row>
        </div>
      )}

      <div data-section="tempering" className={styles.section}>
        <p className={styles.key}>{t('stat_planner.tip.tempering')}</p>
        <table className={styles.tempering}>
          <thead>
            <tr>
              <td />
              {tempering.levels.map((level) => (
                <th key={level} scope="col">
                  {level}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['tempering_bonus', tempering.bonus],
                ['tempering_stones', tempering.stones],
                ['tempering_gold', tempering.gold],
              ] as const
            ).map(
              ([key, cells]) =>
                cells && (
                  <tr key={key}>
                    <th scope="row">{t(`stat_planner.tip.${key}`)}</th>
                    {cells.map((cell, index) => (
                      <td key={tempering.levels[index]}>{cell}</td>
                    ))}
                  </tr>
                )
            )}
          </tbody>
        </table>
        <p className={styles.note}>{t('stat_planner.tip.tempering_note')}</p>
      </div>

      <div data-section="source" className={styles.section}>
        <p className={styles.key}>{detail.howToGet}</p>
        {detail.notes !== null && (
          <p className={styles.warning}>{detail.notes}</p>
        )}
      </div>
    </div>
  );
};

export default WeaponTooltip;
