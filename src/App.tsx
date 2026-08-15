import { lazy, Suspense, useEffect } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { navigation, pageOrder, pages, type WikiPage } from "./site-data";

const DunaWorld = lazy(() => import("./DunaWorld").then((module) => ({ default: module.DunaWorld })));

function Header({ light = false }: { light?: boolean }) {
  return <header className={`site-header${light ? " site-header--light" : ""}`}><Link className="brand" to="/" aria-label="DunaTerp home"><span className="brand-mark" aria-hidden="true">D</span><span>DunaTerp <small>SCU–CHINA · 2026</small></span></Link><nav className="desktop-nav" aria-label="Primary navigation">{navigation.map((group) => <details key={group.label}><summary>{group.label}</summary><div className="nav-popover">{group.items.map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</div></details>)}<Link className="nav-index" to="/wiki-map">Wiki map</Link></nav><details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><div>{navigation.flatMap((group) => group.items).map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}<Link to="/wiki-map">Wiki map</Link></div></details></header>;
}

function Footer() {
  return <footer className="site-footer"><div><p className="footer-brand">DunaTerp · SCU-China 2026</p><p>A modular carotenoid-derivative platform in <i>Dunaliella salina</i>.</p></div><div className="footer-links"><a href="https://gitlab.igem.org/2026/scu-china">Team GitLab</a><a href="https://creativecommons.org/licenses/by/4.0/">Content: CC BY 4.0</a><Link to="/attributions">Attributions</Link><Link to="/responsible-ai">Responsible AI</Link></div></footer>;
}

function Status({ status }: { status: WikiPage["status"] }) {
  const labels = { "team-draft":"Team-review draft", "structure-only":"Team input required", "review-ready":"Reviewed" };
  return <span className={`status status--${status}`}>{labels[status]}</span>;
}

function WikiMap() {
  return <><Header/><main className="map-page"><p className="page-eyebrow">All routes</p><h1>Wiki map</h1><p className="map-intro">The immersive homepage is optional. Every judging-relevant destination below has a stable, direct URL and remains usable without animation.</p><div className="map-grid">{navigation.map((group)=><section key={group.label}><p>{group.label}</p>{group.items.map(([label,href])=><Link key={href} to={href}><span>{label}</span><b aria-hidden="true">↗</b></Link>)}</section>)}</div><div className="compliance-note"><strong>2026 compliance architecture</strong><p>iGEM-hosted assets, reproducible source build, fixed judging URLs, visible licence and repository links, explicit attribution, keyboard access, reduced-motion support and a public AI-use record.</p></div></main><Footer/></>;
}

function Article({ slug }: { slug:string }) {
  const page=pages[slug]; if(!page) return <Navigate to="/wiki-map" replace/>;
  const index=pageOrder.indexOf(slug); const nextSlug=pageOrder[(index+1)%pageOrder.length]; const next=pages[nextSlug];
  const figureSrc=page.figure?`${import.meta.env.BASE_URL}${page.figure.src.replace(/^\//,"")}`:"";
  return <><Header/><main className="article-page"><header className="article-hero"><div><p className="page-eyebrow">{page.eyebrow}</p><h1>{page.title}</h1></div><div className="article-intro"><Status status={page.status}/><p>{page.intro}</p></div></header>{page.figure&&<figure className="feature-figure"><img src={figureSrc} alt={page.figure.alt}/><figcaption>{page.figure.caption}</figcaption></figure>}<div className="article-sections">{page.sections.map((section,i)=><section key={section.title}><div className="section-number">{String(i+1).padStart(2,"0")}</div><div>{section.eyebrow&&<p className="section-eyebrow">{section.eyebrow}</p>}<h2>{section.title}</h2><p>{section.body}</p>{section.items&&<ul>{section.items.map((item)=><li key={item}>{item}</li>)}</ul>}{section.note&&<aside>{section.note}</aside>}</div></section>)}</div><aside className="review-banner"><span>Publication gate</span><p>Before Wiki Freeze, a named team reviewer must verify claims, citations, figures, licences, alt text and correspondence with the official judging form.</p></aside><Link className="next-page" to={`/${nextSlug}`}><span>Next route</span><strong>{next.title}</strong><b aria-hidden="true">→</b></Link></main><Footer/></>;
}

function ScrollAndTitle() {
  const location=useLocation();
  useEffect(()=>{ window.scrollTo(0,0); const slug=location.pathname.replace(/^\//,""); document.title=slug&&pages[slug]?`${pages[slug].title} · DunaTerp`:slug==="wiki-map"?"Wiki map · DunaTerp":"DunaTerp · SCU-China 2026"; },[location.pathname]);
  return null;
}

export default function App() {
  return <><ScrollAndTitle/><Routes><Route path="/" element={<Suspense fallback={<div className="world-loading">Preparing the salt flats…</div>}><DunaWorld Header={Header}/></Suspense>}/><Route path="/wiki-map" element={<WikiMap/>}/>{pageOrder.map((slug)=><Route key={slug} path={`/${slug}`} element={<Article slug={slug}/>}/>) }<Route path="*" element={<Navigate to="/wiki-map" replace/>}/></Routes></>;
}
