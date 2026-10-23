'use client';
import Link from 'next/link';
import { useLearningStore } from '@/stores/learning-store';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import styles from './membership.module.css';
export function PlansScreen() {
 const copy=MEMBERSHIP_COPY[useLearningStore(state=>state.language)];
 const plans=[{name:copy.starter,features:copy.starterFeatures,free:true},{name:copy.pro,features:copy.proFeatures,free:false},{name:copy.expert,features:copy.expertFeatures,free:false}];
 return <section><header className={styles.hero}><h1>{copy.title}</h1><p>{copy.intro}</p></header><div className={styles.grid}>{plans.map(plan=><article key={plan.name} className={styles.card}><h2>{plan.name}</h2><span className={styles.badge}>{plan.free?copy.free:copy.planned}</span><ul>{plan.features.map(feature=><li key={feature}>{feature}</li>)}</ul>{plan.free?<Link href="/courses" className={styles.button}>{copy.start}</Link>:<button disabled className={styles.button}>{copy.unavailable}</button>}</article>)}</div><p className={styles.note}>{copy.note}</p><Link className={styles.button} href="/community">{copy.community}</Link></section>;
}
