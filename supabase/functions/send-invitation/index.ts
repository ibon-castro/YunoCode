import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  projectName: string;
  inviterName: string;
  invitationToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, projectName, inviterName, invitationToken }: InvitationRequest = await req.json();

    console.log("Sending invitation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Project Invitations <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join "${projectName}"`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #333; font-size: 28px; margin: 0;">Project Invitation</h1>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">You're invited to collaborate!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
              <strong>${inviterName}</strong> has invited you to join the project "<strong>${projectName}</strong>".
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin: 0;">
              Click the button below to accept this invitation and start collaborating.
            </p>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${invitationToken}&type=invite&redirect_to=${encodeURIComponent('https://yrmyylutphmiinoccpfs.supabase.co')}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px;">
            <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 0;">
              If you don't want to join this project, you can safely ignore this email. The invitation will expire in 7 days.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);
    
    // If Resend returns an error about domain verification, handle it gracefully
    if (emailResponse.error && emailResponse.error.message) {
      if (emailResponse.error.message.includes("verify a domain")) {
        console.warn("Domain verification required for Resend:", emailResponse.error.message);
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Email sending requires domain verification. Please verify your domain in Resend dashboard.",
          details: emailResponse.error.message
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);