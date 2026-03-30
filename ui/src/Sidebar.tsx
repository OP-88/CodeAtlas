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
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 10px', background: 'transparent', 
                      border: '1px solid #3c3c3c', borderRadius: '4px', 
                      cursor: 'grab', fontSize: '13px', color: '#cccccc', transition: 'all 0.2s',
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
                    <Box size={14} color="#007acc" />
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
