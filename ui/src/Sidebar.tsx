import React, { useState } from 'react';
import { Box, Search } from 'lucide-react';

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


export default function Sidebar({ onOpenRawScript }: { onOpenRawScript: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = CATEGORIES.map(category => ({
    ...category,
    items: category.items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(category => category.items.length > 0);

  return (
    <aside style={{ 
      width: '280px',
      minWidth: '280px',
      flexShrink: 0,
      background: '#1e1e1e', 
      borderRight: '1px solid #333', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '2px 0 10px rgba(0,0,0,0.5)',
      zIndex: 10
    }}>
      <div style={{ padding: '20px 15px 15px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '15px', background: '#252526' }}>
        <h3 style={{ margin: '0', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a0a0a0' }}>
          CodeAtlas Modules
        </h3>
        
        <div 
          onClick={onOpenRawScript}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px 12px', background: '#094771', 
            border: '1px solid #1177bb', borderRadius: '4px', 
            cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: 'white', transition: 'background 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1177bb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#094771'}
        >
          <span style={{ fontSize: '18px', fontFamily: 'monospace' }}>{'</>'}</span>
          <span>Raw Script Engine</span>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          <input 
            type="text" 
            placeholder="Search 150+ frameworks..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#1e1e1e',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              padding: '8px 10px 8px 32px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#007acc'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#3c3c3c'}
          />
        </div>
      </div>

      <div style={{ padding: '15px', overflowY: 'auto', flexGrow: 1 }}>
        {filteredCategories.length === 0 ? (
          <div style={{ color: '#888', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>No modules found</div>
        ) : (
          filteredCategories.map(group => (
            <div key={group.name} style={{ marginBottom: '15px' }}>
              <div style={{ fontSize: '11px', color: '#858585', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {group.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.items.map(comp => (
                  <div 
                    key={comp}
                    onDragStart={(event) => onDragStart(event, 'custom', comp)} 
                    draggable 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', background: 'transparent', 
                      border: '1px solid #3c3c3c', borderRadius: '4px', 
                      cursor: 'grab', fontSize: '13px', color: '#d4d4d4', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2a2d2e';
                      e.currentTarget.style.borderColor = '#454545';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#3c3c3c';
                    }}
                  >
                    {getDeviconClass(comp) ? (
                      <i className={`${getDeviconClass(comp)} colored`} style={{ fontSize: '16px' }}></i>
                    ) : (
                      <Box size={14} color="#007acc" />
                    )}
                    {comp}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
