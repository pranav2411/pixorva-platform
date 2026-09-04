export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  token: string;
  created: string;
  usedToday: number;
  dailyLimit: number;
}

export interface PaymentLog {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  razorpayId: string;
  created: string;
}

export interface WebsiteItem {
  id: string;
  userId: string;
  url: string;
  created: string;
}

export interface CustomAgentRequest {
  id: string;
  refId: string;
  userId?: string;
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
  roles: string[];
  integrations: string[];
  bottlenecks: string;
  dailyVolume: string;
  hostingPreference: string;
  fullName: string;
  workEmail: string;
  phone: string;
  timeline: string;
  additionalNotes?: string;
  status: 'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED';
  created: string;
}

export const LocalDb = {
  // --- API KEYS ---
  async getApiKeys(supabase: any, userId: string): Promise<ApiKey[]> {
    const { data: keysData } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .eq('schedule', 'API_KEY');

    if (!keysData) return [];

    const keys: ApiKey[] = [];
    for (const k of keysData) {
      const usedToday = await this.getApiKeyUsageToday(supabase, k.id);
      keys.push({
        id: k.id,
        userId: k.user_id,
        name: k.goal || 'API Key',
        token: k.instructions || '',
        created: new Date(k.created_at).toLocaleDateString(),
        usedToday,
        dailyLimit: 1000
      });
    }
    return keys;
  },

  async addApiKey(supabase: any, userId: string, name: string): Promise<ApiKey> {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    const randChars = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    const token = `px_live_${randChars}`;
    
    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: `[API_KEY] ${name}`,
        goal: name,
        instructions: token,
        schedule: 'API_KEY',
        steps: []
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.goal,
      token: data.instructions,
      created: new Date(data.created_at).toLocaleDateString(),
      usedToday: 0,
      dailyLimit: 1000
    };
  },

  async revokeApiKey(supabase: any, userId: string, id: string): Promise<boolean> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('schedule', 'API_KEY');

    return !error;
  },

  async validateKey(supabase: any, token: string): Promise<ApiKey | null> {
    // Fallback for user's specific test key (development only)
    if (process.env.NODE_ENV !== 'production' && token === 'px_live_mymggt4zysn1shb9fj2mhjci') {
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      const testUserId = profiles && profiles.length > 0 ? profiles[0].id : 'dca294a3-b71f-47f3-a193-f75bc5aadbde';
      return {
        id: 'test-key-id',
        userId: testUserId,
        name: 'Sandbox Test Key',
        token: token,
        created: new Date().toLocaleDateString(),
        usedToday: 0,
        dailyLimit: 1000
      };
    }

    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('instructions', token)
      .eq('schedule', 'API_KEY')
      .maybeSingle();

    if (!data) return null;

    const usedToday = await this.getApiKeyUsageToday(supabase, data.id);
    return {
      id: data.id,
      userId: data.user_id,
      name: data.goal,
      token: data.instructions,
      created: new Date(data.created_at).toLocaleDateString(),
      usedToday,
      dailyLimit: 1000
    };
  },

  async incrementKeyUsage(supabase: any, token: string, tokens: number, input: string, result: string) {
    let targetUserId = null;
    let targetAgentId = null;

    if (process.env.NODE_ENV !== 'production' && token === 'px_live_mymggt4zysn1shb9fj2mhjci') {
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
      targetUserId = profiles && profiles.length > 0 ? profiles[0].id : 'dca294a3-b71f-47f3-a193-f75bc5aadbde';
      
      const { data: agents } = await supabase.from('agents').select('id').eq('user_id', targetUserId).neq('schedule', 'API_KEY').neq('schedule', 'INVOICE').limit(1);
      targetAgentId = agents && agents.length > 0 ? agents[0].id : 'test-key-id';
    } else {
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('instructions', token)
        .eq('schedule', 'API_KEY')
        .maybeSingle();
      if (agent) {
        targetUserId = agent.user_id;
        targetAgentId = agent.id;
      }
    }

    if (targetUserId && targetAgentId) {
      await supabase.from('tasks').insert({
        user_id: targetUserId,
        agent_id: targetAgentId,
        input: input,
        result: result,
        type: 'api_run'
      });
    }
  },

  async getApiKeyUsageToday(supabase: any, keyAgentId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isoStart = startOfToday.toISOString();

    const { data } = await supabase
      .from('tasks')
      .select('result')
      .eq('agent_id', keyAgentId)
      .eq('type', 'api_run')
      .gte('created_at', isoStart);
      
    if (!data) return 0;
    return data.reduce((acc: number, t: any) => {
      const len = t.result ? t.result.length : 0;
      return acc + Math.ceil(len / 4);
    }, 0);
  },

  // --- PAYMENTS ---
  async getPayments(supabase: any, userId: string): Promise<PaymentLog[]> {
    const { data: invoices } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .eq('schedule', 'INVOICE');

    if (!invoices) return [];

    return invoices.map((inv: any) => {
      let meta: any = {};
      try {
        meta = JSON.parse(inv.instructions || '{}');
      } catch (e) {}

      return {
        id: inv.id,
        userId: inv.user_id,
        planName: meta.planName || inv.name.replace('[INVOICE] ', ''),
        amount: meta.amount || 0,
        razorpayId: inv.goal || '',
        created: new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
    });
  },

  async addPayment(supabase: any, userId: string, planName: string, amount: number, razorpayId: string): Promise<PaymentLog> {
    const payload = JSON.stringify({ planName, amount });
    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: `[INVOICE] ${planName}`,
        goal: razorpayId,
        instructions: payload,
        schedule: 'INVOICE',
        steps: []
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      planName,
      amount,
      razorpayId,
      created: new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  },

  // --- CONNECTED WEBSITES ---
  async getWebsites(supabase: any, userId: string, defaultWebsite?: string): Promise<WebsiteItem[]> {
    const { data: sitesData } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .eq('schedule', 'WEBSITE')
      .order('created_at', { ascending: true });

    if (sitesData && sitesData.length > 0) {
      return sitesData.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        url: s.goal || s.instructions || '',
        created: new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      }));
    }

    // If no website stored yet but user provided one during onboarding, automatically seed it!
    if (defaultWebsite && defaultWebsite.trim()) {
      try {
        const added = await this.addWebsite(supabase, userId, defaultWebsite.trim());
        return [added];
      } catch (err) {
        console.error("Failed to seed default onboarding website:", err);
      }
    }

    return [];
  },

  async addWebsite(supabase: any, userId: string, url: string): Promise<WebsiteItem> {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const { data, error } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        name: `[WEBSITE] ${cleanUrl}`,
        goal: cleanUrl,
        instructions: cleanUrl,
        schedule: 'WEBSITE',
        steps: []
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      url: data.goal,
      created: new Date(data.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  },

  async updateWebsite(supabase: any, userId: string, id: string, newUrl: string): Promise<boolean> {
    let cleanUrl = newUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const { error } = await supabase
      .from('agents')
      .update({
        name: `[WEBSITE] ${cleanUrl}`,
        goal: cleanUrl,
        instructions: cleanUrl
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('schedule', 'WEBSITE');

    return !error;
  },

  async deleteWebsite(supabase: any, userId: string, id: string): Promise<boolean> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('schedule', 'WEBSITE');

    return !error;
  },

  // --- CUSTOM ENTERPRISE AGENT REQUESTS ---
  async saveCustomAgentRequest(supabase: any, data: Omit<CustomAgentRequest, 'id' | 'refId' | 'created' | 'status'> & { refId?: string }): Promise<CustomAgentRequest> {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const refId = data.refId || `PX-REQ-${randomSuffix}`;

    const payload = {
      refId,
      companyName: data.companyName,
      website: data.website,
      industry: data.industry,
      companySize: data.companySize,
      roles: data.roles,
      integrations: data.integrations,
      bottlenecks: data.bottlenecks,
      dailyVolume: data.dailyVolume,
      hostingPreference: data.hostingPreference,
      fullName: data.fullName,
      workEmail: data.workEmail,
      phone: data.phone,
      timeline: data.timeline,
      additionalNotes: data.additionalNotes || '',
      status: 'PENDING'
    };

    // If supabase instance is available, try to persist to agents table
    let recordId = `req_${Date.now()}_${randomSuffix}`;
    if (supabase) {
      try {
        const { data: dbData, error } = await supabase
          .from('agents')
          .insert({
            user_id: data.userId || null,
            name: `[CUSTOM_REQUEST] ${data.companyName} (${refId})`,
            goal: `Custom Agent Request for ${data.companyName} - Roles: ${data.roles.join(', ')}`,
            instructions: JSON.stringify(payload),
            schedule: 'CUSTOM_AGENT_REQUEST',
            steps: data.roles
          })
          .select()
          .single();

        if (!error && dbData) {
          recordId = dbData.id;
        }
      } catch (err) {
        console.warn('Could not persist custom agent request to Supabase directly:', err);
      }
    }

    return {
      id: recordId,
      ...payload,
      status: 'PENDING',
      created: new Date().toISOString()
    };
  },

  async getCustomAgentRequests(supabase: any): Promise<CustomAgentRequest[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('schedule', 'CUSTOM_AGENT_REQUEST')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => {
        let parsed: any = {};
        try {
          parsed = JSON.parse(item.instructions || '{}');
        } catch (e) {
          parsed = {};
        }

        return {
          id: item.id,
          refId: parsed.refId || item.name.match(/\((.*?)\)/)?.[1] || item.id.slice(0, 8),
          userId: item.user_id,
          companyName: parsed.companyName || item.name.replace('[CUSTOM_REQUEST] ', ''),
          website: parsed.website || '',
          industry: parsed.industry || 'General',
          companySize: parsed.companySize || 'Unknown',
          roles: parsed.roles || item.steps || [],
          integrations: parsed.integrations || [],
          bottlenecks: parsed.bottlenecks || '',
          dailyVolume: parsed.dailyVolume || '',
          hostingPreference: parsed.hostingPreference || 'Managed',
          fullName: parsed.fullName || '',
          workEmail: parsed.workEmail || '',
          phone: parsed.phone || '',
          timeline: parsed.timeline || 'Immediate',
          additionalNotes: parsed.additionalNotes || '',
          status: parsed.status || 'PENDING',
          created: item.created_at
        };
      });
    } catch (err) {
      console.error('Error fetching custom agent requests:', err);
      return [];
    }
  }
};
