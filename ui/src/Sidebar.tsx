import React, { useState } from 'react';
import { Box, Search, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const CATEGORIES = [
  {
    name: "Frontend",
    items: ["React SPA", "Vue.js", "Angular", "SvelteKit", "Next.js", "Nuxt.js", "Ember.js", "Backbone.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Three.js", "Webpack", "Vite", "Babel", "SolidJS", "Qwik"]
  },
  {
    name: "Backend",
    items: ["Node.js API", "Python FastAPI", "Django", "Flask API", "Spring Boot", "Ruby on Rails", "Express.js Server", "NestJS", "Laravel", "ASP.NET Core", "Go Microservice", "Rust API", "Gin", "Echo", "Fiber", "Koa", "Phoenix", "Ktor", "Actix", "Rocket"]
  },
  {
    name: "Databases",
    items: ["PostgreSQL DB", "MySQL Cluster", "MongoDB Replica", "Redis Cache", "SQLite", "Oracle DB", "SQL Server", "Cassandra", "DynamoDB Table", "CouchDB", "Neo4j Graph", "MariaDB", "Elasticsearch", "Firebase", "Supabase", "Prisma ORM", "Sequelize ORM", "Mongoose", "TypeORM", "Drizzle"]
  },
  {
    name: "Infrastructure/DevOps",
    items: ["Docker Container", "Kubernetes Pod", "AWS EC2 Instance", "AWS S3 Bucket", "AWS Lambda", "Google Cloud", "Azure VM", "Terraform Module", "Ansible Playbook", "Jenkins Pipeline", "GitHub Actions", "GitLab CI", "CircleCI", "Nginx Proxy", "Apache HTTP", "Prometheus", "Grafana Dashboard", "Datadog", "Splunk", "New Relic"]
  },
  {
    name: "Mobile",
    items: ["React Native App", "Flutter App", "Swift iOS", "Kotlin Android", "Objective-C", "Java (Android)", "Ionic App", "Cordova", "Xamarin App", "Expo", "Capacitor", "Sencha", "NativeScript", "PhoneGap", "Appcelerator"]
  },
  {
    name: "AI/Machine Learning",
    items: ["TensorFlow Model", "PyTorch Network", "Scikit-Learn", "Keras", "Pandas DataFrame", "NumPy Array", "OpenCV", "Hugging Face Transformer", "LangChain Agent", "OpenAI API", "NLTK", "Spacy", "XGBoost", "LightGBM", "Matplotlib", "Seaborn"]
  },
  {
    name: "Security",
    items: ["OAuth2 Provider", "JWT Authenticator", "Auth0 Gateway", "Okta Policy", "Keycloak", "HashiCorp Vault", "SonarQube", "OWASP ZAP", "Metasploit", "Burp Suite", "WireShark", "Nmap", "Kali Linux", "Snort", "Falcon"]
  },
  {
    name: "Languages (Core)",
    items: ["JavaScript", "TypeScript", "Python Script", "Java Application", "C++ Library", "C# App", "Ruby Script", "PHP File", "Swift Script", "Go Script", "Rust Bin", "Kotlin App", "Scala", "Dart", "R Script", "Perl", "Haskell", "Lua", "Julia", "Assembly"]
  }
];

// Smart fuzzy matcher for 150+ framework identities
const getDeviconClass = (name: string): string | null => {
  const n = name.toLowerCase();
  
  // Frontend
  if (n.includes('react')) return 'devicon-react-original';
  if (n.includes('vue')) return 'devicon-vuejs-plain';
  if (n.includes('angular')) return 'devicon-angularjs-plain';
  if (n.includes('svelte')) return 'devicon-svelte-plain';
  if (n.includes('next')) return 'devicon-nextjs-original';
  if (n.includes('nuxt')) return 'devicon-nuxtjs-plain';
  if (n.includes('ember')) return 'devicon-ember-original-wordmark';
  if (n.includes('backbone')) return 'devicon-backbonejs-plain';
  if (n.includes('html')) return 'devicon-html5-plain';
  if (n.includes('css')) return 'devicon-css3-plain';
  if (n.includes('tailwind')) return 'devicon-tailwindcss-plain';
  if (n.includes('bootstrap')) return 'devicon-bootstrap-plain';
  if (n.includes('material')) return 'devicon-materialui-plain';
  if (n.includes('three.js')) return 'devicon-threejs-original';
  if (n.includes('webpack')) return 'devicon-webpack-plain';
  if (n.includes('vite')) return 'devicon-vitejs-plain';
  if (n.includes('babel')) return 'devicon-babel-plain';
  if (n.includes('solidjs')) return 'devicon-solidjs-plain';

  // Backend
  if (n.includes('node')) return 'devicon-nodejs-plain';
  if (n.includes('fastapi')) return 'devicon-fastapi-plain';
  if (n.includes('django')) return 'devicon-django-plain';
  if (n.includes('flask')) return 'devicon-flask-original';
  if (n.includes('spring')) return 'devicon-spring-custom'; // or plain
  if (n.includes('ruby') || n.includes('rails')) return 'devicon-ruby-plain';
  if (n.includes('express')) return 'devicon-express-original';
  if (n.includes('nestjs')) return 'devicon-nestjs-plain';
  if (n.includes('laravel')) return 'devicon-laravel-plain';
  if (n.includes('asp.net') || n.includes('dotnet')) return 'devicon-dotnetcore-plain';
  if (n.includes('go ')) return 'devicon-go-original-wordmark';
  if (n.includes('rust')) return 'devicon-rust-plain';
  if (n.includes('phoenix')) return 'devicon-phoenix-plain';

  // Databases
  if (n.includes('postgres')) return 'devicon-postgresql-plain';
  if (n.includes('mysql')) return 'devicon-mysql-plain';
  if (n.includes('mongo')) return 'devicon-mongodb-plain';
  if (n.includes('redis')) return 'devicon-redis-plain';
  if (n.includes('sqlite')) return 'devicon-sqlite-plain';
  if (n.includes('oracle')) return 'devicon-oracle-original';
  if (n.includes('sql server')) return 'devicon-microsoftsqlserver-plain';
  if (n.includes('cassandra')) return 'devicon-cassandra-plain';
  if (n.includes('couchdb')) return 'devicon-couchdb-plain';
  if (n.includes('neo4j')) return 'devicon-neo4j-plain';
  if (n.includes('elasticsearch')) return 'devicon-elasticsearch-plain';
  if (n.includes('firebase')) return 'devicon-firebase-plain';
  if (n.includes('supabase')) return 'devicon-supabase-plain';
  if (n.includes('prisma')) return 'devicon-prisma-original';
  if (n.includes('sequelize')) return 'devicon-sequelize-plain';
  if (n.includes('mongoose')) return 'devicon-mongoose-original';

  // Cloud/Infra
  if (n.includes('docker')) return 'devicon-docker-plain';
  if (n.includes('kubernetes')) return 'devicon-kubernetes-plain';
  if (n.includes('aws') || n.includes('amazon') || n.includes('ec2') || n.includes('s3')) return 'devicon-amazonwebservices-original';
  if (n.includes('google cloud')) return 'devicon-googlecloud-plain';
  if (n.includes('azure')) return 'devicon-azure-plain';
  if (n.includes('terraform')) return 'devicon-terraform-plain';
  if (n.includes('ansible')) return 'devicon-ansible-plain';
  if (n.includes('jenkins')) return 'devicon-jenkins-line';
  if (n.includes('github') || n.includes('actions')) return 'devicon-github-original';
  if (n.includes('gitlab')) return 'devicon-gitlab-plain';
  if (n.includes('circleci')) return 'devicon-circleci-plain';
  if (n.includes('nginx')) return 'devicon-nginx-original';
  if (n.includes('apache')) return 'devicon-apache-plain';
  if (n.includes('prometheus')) return 'devicon-prometheus-original';
  if (n.includes('grafana')) return 'devicon-grafana-original';
  if (n.includes('splunk')) return 'devicon-splunk-original';
  if (n.includes('datadog')) return 'devicon-datadog-plain';

  // Mobile
  if (n.includes('flutter')) return 'devicon-flutter-plain';
  if (n.includes('swift')) return 'devicon-swift-plain';
  if (n.includes('kotlin')) return 'devicon-kotlin-plain';
  if (n.includes('objective-c')) return 'devicon-objectivec-plain';
  if (n.includes('ionic')) return 'devicon-ionic-original';
  if (n.includes('xamarin')) return 'devicon-xamarin-original';
  if (n.includes('appcelerator')) return 'devicon-appcelerator-original';

  // Machine Learning
  if (n.includes('tensorflow')) return 'devicon-tensorflow-original';
  if (n.includes('pytorch')) return 'devicon-pytorch-original';
  if (n.includes('scikit')) return 'devicon-scikitlearn-plain';
  if (n.includes('pandas')) return 'devicon-pandas-original';
  if (n.includes('numpy')) return 'devicon-numpy-original';
  if (n.includes('opencv')) return 'devicon-opencv-plain';

  // Security
  if (n.includes('oauth')) return 'devicon-oauth-plain';
  if (n.includes('sonarqube')) return 'devicon-sonarqube-plain';

  // Core Languages
  if (n.includes('javascript')) return 'devicon-javascript-plain';
  if (n.includes('typescript')) return 'devicon-typescript-plain';
  if (n.includes('python')) return 'devicon-python-plain';
  if (n.includes('java ') || n.endsWith('java')) return 'devicon-java-plain';
  if (n.includes('c++')) return 'devicon-cplusplus-plain';
  if (n.includes('c#')) return 'devicon-csharp-plain';
  if (n.includes('php')) return 'devicon-php-plain';
  if (n.includes('dart')) return 'devicon-dart-plain';
  if (n.includes('scala')) return 'devicon-scala-plain';
  if (n.includes('r script')) return 'devicon-r-original';
  if (n.includes('haskell')) return 'devicon-haskell-plain';
  if (n.includes('lua')) return 'devicon-lua-plain';
  if (n.includes('julia')) return 'devicon-julia-plain';
  if (n.includes('bash') || n.includes('shell')) return 'devicon-bash-plain';
  
  // Return null so the UI falls back to a standardized blue box icon
  return null;
};


export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) =>
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = CATEGORIES.map(category => ({
    ...category,
    items: category.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(category => category.items.length > 0);

  // Collapsed icon-rail when sidebar is minimized
  if (!sidebarOpen) {
    return (
      <aside style={{
        width: '42px', minWidth: '42px', flexShrink: 0,
        background: '#1e1e1e', borderRight: '1px solid #2d2d2d',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '10px', zIndex: 10,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          title="Expand library"
          style={{
            background: 'transparent', border: 'none', color: '#666',
            cursor: 'pointer', padding: '8px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ccc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
        >
          <PanelLeftOpen size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside style={{
      width: '272px', minWidth: '272px', flexShrink: 0,
      background: '#1e1e1e', borderRight: '1px solid #2d2d2d',
      display: 'flex', flexDirection: 'column',
      boxShadow: '2px 0 10px rgba(0,0,0,0.4)', zIndex: 10,
    }}>
      {/* Header row */}
      <div style={{
        padding: '10px 12px 10px 14px',
        borderBottom: '1px solid #2d2d2d',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: '#252526', flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#777' }}>
          Module Library
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          title="Collapse library"
          style={{
            background: 'transparent', border: 'none', color: '#555',
            cursor: 'pointer', padding: '3px', display: 'flex',
            borderRadius: '3px', transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ccc'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2d2d2d', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input
            type="text"
            placeholder="Search 150+ modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: '#1a1a1a',
              border: '1px solid #333', borderRadius: '4px',
              padding: '7px 10px 7px 30px',
              color: '#ccc', fontSize: '12px', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007acc'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
          />
        </div>
      </div>

      {/* Category list */}
      <div style={{ overflowY: 'auto', flexGrow: 1, padding: '6px 0' }}>
        {filteredCategories.length === 0 ? (
          <div style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>No modules found</div>
        ) : (
          filteredCategories.map(group => {
            const isCollapsed = !!collapsed[group.name] && !searchQuery;
            return (
              <div key={group.name}>
                {/* Category header — click to collapse */}
                <button
                  onClick={() => toggleCategory(group.name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 14px', background: 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: '#666', fontSize: '10px',
                    fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', textAlign: 'left',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#aaa')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                  {group.name}
                  {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '0 8px 8px 8px' }}>
                    {group.items.map(comp => (
                      <div
                        key={comp}
                        onDragStart={(event) => onDragStart(event, 'custom', comp)}
                        draggable
                        style={{
                          display: 'flex', alignItems: 'center', gap: '9px',
                          padding: '7px 10px', background: 'transparent',
                          border: '1px solid transparent', borderRadius: '4px',
                          cursor: 'grab', fontSize: '12px', color: '#c0c0c0',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2a2d2e';
                          e.currentTarget.style.borderColor = '#3c3c3c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        {getDeviconClass(comp) ? (
                          <i className={`${getDeviconClass(comp)} colored`} style={{ fontSize: '15px', flexShrink: 0 }}></i>
                        ) : (
                          <Box size={13} color="#007acc" style={{ flexShrink: 0 }} />
                        )}
                        {comp}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
