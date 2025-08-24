import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MessageCircle, Heart, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function PersonaSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Learn with Jun Kang
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet Chong Jun Kang, a 19-year-old Chinese Malaysian university student in his first serious relationship. 
            He&apos;ll guide your learning journey with relatable experiences and insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="p-8 bg-card/80 backdrop-blur-sm">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">JK</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-foreground">Chong Jun Kang</h3>
                  <Badge variant="secondary">19 years old</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Business Administration student at Taylor&apos;s University in Shah Alam. Eldest of three siblings, 
                  in his first serious relationship with Xin Yi for 3 months. Seeks reliable health information.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">First Relationship</Badge>
                  <Badge variant="outline">University Student</Badge>
                  <Badge variant="outline">Responsible Eldest</Badge>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCircle size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Jun Kang says:</span>
              </div>
              <p className="text-muted-foreground text-sm italic">
                &ldquo;At first I felt paiseh (shy) to ask about these things, especially with my traditional family background. 
                But after my mum&apos;s vague warnings about &lsquo;diseases&rsquo;, I realized I need proper knowledge to protect 
                myself and Xin Yi. Safhira gives me the facts without judgment.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3">
                <div className="text-2xl font-bold text-primary mb-1">4+</div>
                <div className="text-xs text-muted-foreground">Modules Completed</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-primary mb-1">85%</div>
                <div className="text-xs text-muted-foreground">Quiz Score</div>
              </div>
              <div className="p-3">
                <div className="text-2xl font-bold text-primary mb-1">12</div>
                <div className="text-xs text-muted-foreground">Chat Questions</div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6 bg-card/70 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="text-yellow-500" size={20} />
                <h4 className="font-semibold text-foreground">Jun Kang&apos;s Learning Journey</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">STI Basics and Prevention</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Health Testing and Treatment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Communication with Partner</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Myths and Facts</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-border">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="text-destructive" size={20} />
                <h4 className="font-semibold text-foreground">Jun Kang&apos;s Tip</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                &ldquo;Don&apos;t feel malu (embarrassed) to learn about these things! Even though my family 
                rarely discussed it openly, sexual health is important for our future. The AI chat 
                here helped me ask questions I was too shy to ask anyone else.&rdquo;
              </p>
              <Button variant="outline" size="sm">
                Chat with Jun Kang AI
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}