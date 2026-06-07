import { NextRequest, NextResponse } from 'next/server';
import { fetchPassage } from '@/lib/supabase/server-db';
import { verifyAuth, unauthorized } from '@/lib/auth/verifyAuth';
import type { Difficulty, Length, Language } from '@/lib/supabase/types';

interface GeneratePassageRequest {
    difficulty: Difficulty;
    length: Length;
    language: Language;
    excludePassageId?: string;
}

export async function POST(request: NextRequest) {
    const authUser = await verifyAuth(request);
    if (!authUser) return unauthorized();

    try {
        const body: GeneratePassageRequest = await request.json();
        const { difficulty, length, language, excludePassageId } = body;

        const passage = await fetchPassage({
            difficulty,
            length,
            language,
            userId: authUser.uid,
            excludePassageId,
        });

        if (passage) {
            return NextResponse.json({
                passage: passage.content,
                passageId: passage.id,
                source: 'db',
            });
        }

        // No passage in DB — use local fallback
        const fallbackPassages: Record<Language, Record<Difficulty, string>> = {
            english: {
                beginner: 'The cat sat on the mat. It was a sunny day. Birds sang in the trees. The dog ran fast.',
                advanced: 'Technology has changed how we communicate and work. From smartphones to computers, digital tools help us stay connected. Learning to type quickly improves productivity and saves time every day.',
                expert: 'Artificial intelligence & machine learning algorithms have become increasingly sophisticated! They enable computers to perform complex tasks: data analysis, pattern recognition, and decision-making. These technologies are transforming industries—from healthcare to finance—at an unprecedented rate (2020-2026).',
            },
            lao: {
                beginner: 'ມື້ນີ້ແມ່ນມື້ທີ່ດີ. ຟ້າແຈ່ມໃສ. ນົກຮ້ອງເພງຢູ່ເທິງຕົ້ນໄມ້. ແມວນອນຢູ່ເທິງເຕຍ.',
                advanced: 'ເຕັກໂນໂລຊີໄດ້ປ່ຽນແປງວິທີການສື່ສານຂອງພວກເຮົາ. ຈາກໂທລະສັບມືຖືໄປຫາຄອມພິວເຕີ. ເຄື່ອງມືດິຈິຕອນຊ່ວຍໃຫ້ພວກເຮົາເຊື່ອມຕໍ່ກັນ. ການຮຽນຮູ້ການພິມໄວຊ່ວຍເພີ່ມປະສິດທິພາບ.',
                expert: 'ປັນຍາປະດິດ & ການຮຽນຮູ້ຂອງເຄື່ອງຈັກໄດ້ກາຍເປັນທີ່ຊັບຊ້ອນຫຼາຍຂຶ້ນ! ເຮັດໃຫ້ຄອມພິວເຕີສາມາດປະຕິບັດວຽກງານທີ່ສັບຊ້ອນ: ການວິເຄາະຂໍ້ມູນ, ການຮັບຮູ້ຮູບແບບ, ແລະການຕັດສິນໃຈ. ເຕັກໂນໂລຊີເຫຼົ່ານີ້ກຳລັງປ່ຽນແປງອຸດສາຫະກຳ—ຕັ້ງແຕ່ການດູແລສຸຂະພາບໄປຈົນເຖິງການເງິນ—ໃນອັດຕາທີ່ບໍ່ເຄີຍມີມາກ່ອນ (2020-2026).',
            },
        };

        return NextResponse.json({
            passage: fallbackPassages[language][difficulty],
            source: 'fallback',
        });
    } catch (error) {
        console.error('GeneratePassage API Error:', error);
        return NextResponse.json({ error: 'Failed to generate passage' }, { status: 500 });
    }
}
