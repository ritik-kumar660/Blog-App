import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Ritik Kumar',
  description: 'Learn more about Ritik Kumar, a passionate Full-Stack Developer.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Sidebar: Sticky Profile Card */}
        <div className="w-full lg:w-[400px] shrink-0 sticky top-24">
          <div className="relative isolate overflow-hidden rounded-3xl bg-card border border-border/50 shadow-xl group">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100" />
            
            <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center font-bold text-3xl text-primary mb-6 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              RK
            </div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2">Ritik Kumar</h1>
            <h2 className="text-primary font-semibold mb-6">Full-Stack Developer</h2>

            <div className="space-y-4 text-sm text-muted-foreground mb-8">
                   <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0 mt-0.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      <div>
                        <strong className="text-foreground block">Lovely Professional University</strong>
                        B.Tech in Computer Science<br/>
                        <span className="text-primary font-medium">CGPA: 7.67</span>
                      </div>
                   </div>

                 <div className="flex items-start gap-3 pt-2">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0 mt-0.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                   <div>
                      <strong className="text-foreground block">Email</strong>
                    <a href="mailto:ritikkumarharhar660@gmail.com" className="hover:text-primary transition-colors hover:underline">
                      ritikkumarharhar660@gmail.com
                    </a>
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://github.com/ritik-kumar660" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/40 text-sm font-medium hover:bg-foreground/5 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/ritik-kumar660/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/40 text-sm font-medium hover:bg-primary/20 hover:text-primary transition-colors hover:border-primary/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 space-y-12">
           
           <section>
             <h3 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
               <span className="text-primary">👨‍💻</span> About Me
             </h3>
             <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
               <p>
                 Hi, I&apos;m <strong className="text-foreground">Ritik Kumar</strong>, a passionate <strong className="text-foreground">Full-Stack Developer</strong> and Computer Science student at Lovely Professional University. I enjoy building modern, scalable web applications that solve real-world problems and deliver meaningful user experiences.
               </p>
               <p>
                 With a strong foundation in <strong className="text-foreground">Data Structures and Algorithms</strong>, I focus on writing efficient, clean, and optimized code. I love exploring new technologies and continuously improving my development skills.
               </p>
             </div>
           </section>

           <div className="h-px w-full bg-border/20" />

           <section>
             <h3 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
               <span className="text-primary">🚀</span> What I Do
             </h3>
             <ul className="grid sm:grid-cols-2 gap-4">
               {[
                 { title: "Full-Stack Web", desc: "Build applications using React.js, Next.js, Node.js, and MongoDB.", icon: "⚛️" },
                 { title: "Intelligent Systems", desc: "Develop architectures powered by AI and sophisticated REST APIs.", icon: "🧠" },
                 { title: "UI / UX", desc: "Create responsive, deeply interactive, and user-friendly interfaces.", icon: "✨" },
                 { title: "Algorithmic Problem Solving", desc: "Solve complex architectural problems using rigorous DSA thinking.", icon: "⚙️" },
               ].map((item, idx) => (
                 <li key={idx} className="bg-card border border-border/50 rounded-2xl p-5 hover:bg-foreground/5 transition-all">
                   <div className="text-xl mb-3">{item.icon}</div>
                   <strong className="text-foreground block mb-1">{item.title}</strong>
                   <span className="text-sm text-muted-foreground">{item.desc}</span>
                 </li>
               ))}
             </ul>
           </section>

           <section>
             <h3 className="text-3xl font-bold tracking-tight mb-6 flex items-center gap-3">
               <span className="text-primary">🌱</span> Currently Learning
             </h3>
             <div className="flex flex-wrap gap-3">
               {["Advanced Full-Stack Development", "System Design", "AI-powered applications"].map((tag) => (
                 <span key={tag} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary font-medium text-sm shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                   {tag}
                 </span>
               ))}
             </div>
           </section>

           <div className="h-px w-full bg-border/20" />

           <section className="bg-card border border-border/50 rounded-3xl p-8 relative overflow-hidden text-center shadow-sm">
             <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
             <h3 className="text-2xl font-bold tracking-tight mb-2">Let&apos;s Connect</h3>
             <p className="text-muted-foreground mb-8 max-w-md mx-auto">
               I&apos;m always open to collaboration, learning opportunities, and exciting projects.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity shadow-xl">
                    Get in Touch
                  </button>
                </Link>
             </div>
             
             <p className="mt-12 text-sm italic text-muted-foreground/50 font-serif">
               “Building solutions that make an impact 🚀”
             </p>
           </section>
        </div>
        
      </div>
    </div>
  );
}
