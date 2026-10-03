import "./_group.css";
import "./_responsive.css";

const regions = [
  "North America",
  "Europe",
  "Latin America",
  "Africa",
  "Middle East",
  "Asia Pacific",
];

const sectors = [
  "Higher Education",
  "Government",
  "Enterprise",
  "Non-Profits",
  "Industry Partners",
];

const institutions = [
  { name: "University of Europe", file: "trust-logo-ue-web.png", width: 179, height: 57 },
  { name: "IEEE", file: "trust-logo-ieee-web.png", width: 296, height: 92 },
  { name: "Harvard Business Publishing", file: "trust-logo-harvard-web.png", width: 296, height: 114 },
  { name: "Project Management Institute", file: "trust-logo-pmi-web.png", width: 548, height: 170 },
  { name: "Indian Institute of Science", file: "trust-logo-iisc-web.png", width: 548, height: 483 },
  { name: "DCU", file: "trust-logo-dcu-web.png", width: 542, height: 548 },
];

export function Responsive() {
  return (
    <div className="trust-responsive-preview">
    <section
      className="homepage-trust-banner trust-responsive"
      id="homepage-trust-banner"
      aria-labelledby="homepage-trust-banner-title"
    >
      <div className="trust-responsive__inner">
        <div className="trust-responsive__main">
          <header className="trust-responsive__copy">
            <p className="trust-responsive__eyebrow">A global learning community</p>
            <h2 id="homepage-trust-banner-title">
              Trusted by Institutions. Used by Learners. Valued Worldwide.
            </h2>
            <p className="trust-responsive__summary">
              Powering a more open, skilled and opportunity-ready world.
            </p>
            <div className="homepage-section-cta trust-responsive__action">
              <a
                className="homepage-section-cta__link trust-responsive__cta"
                href="https://info.certifyme.online/request-demo"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Request a demo — Institutional trust and global reach"
              >
                Request a Demo <span aria-hidden="true">→</span>
              </a>
            </div>
            <ul className="trust-responsive__stats" aria-label="Platform reach">
              <li>
                <strong>5K+</strong>
                <span>Institutions trust our platform</span>
              </li>
              <li>
                <strong>1M+</strong>
                <span>Learners worldwide</span>
              </li>
              <li>
                <strong className="trust-responsive__global">Global reach</strong>
                <span>Across diverse regions and sectors</span>
              </li>
            </ul>
          </header>

          <figure className="trust-responsive__map">
            <img
              src="/__mockup/images/trust-world-map.webp"
              alt="World map showing North America, Europe, Latin America, Africa, the Middle East and Asia Pacific"
              width="960"
              height="480"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="trust-responsive__regions">
              {regions.map((region, index) => (
                <span key={region}>
                  {region}
                  {index < regions.length - 1 && (
                    <span className="trust-responsive__region-separator" aria-hidden="true">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </figcaption>
          </figure>
        </div>

        <section className="trust-responsive__sectors" aria-labelledby="trust-sectors-title">
          <h3 id="trust-sectors-title">Trusted across sectors</h3>
          <ul>
            {sectors.map((sector) => <li key={sector}>{sector}</li>)}
          </ul>
        </section>

        <div className="trust-responsive__institutions" aria-label="Trusted institutions">
          {institutions.map((institution) => (
            <div className="trust-responsive__logo" key={institution.file}>
              <img
                src={`/__mockup/images/${institution.file}`}
                alt={institution.name}
                width={institution.width}
                height={institution.height}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}