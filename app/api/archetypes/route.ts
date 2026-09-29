import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getUserProfileWithPartner } from '@/lib/auth';
import { executeQuery } from '@/lib/db';
import { animalLibrary } from '@/lib/animal-archetypes';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = Number(payload.userId);
    const userProfile = await getUserProfileWithPartner(currentUserId);
    const partner = userProfile?.partner || null;

    // 1. Fetch current user's submission
    const mySubmissions: any = await executeQuery(
      'SELECT looks_animal, behavior_animal, with_you_animal, created_at, updated_at FROM animal_archetypes WHERE user_id = $1',
      [currentUserId]
    );
    const myArchetype = mySubmissions?.[0] ? {
      looksAnimal: mySubmissions[0].looks_animal,
      behaviorAnimal: mySubmissions[0].behavior_animal,
      withYouAnimal: mySubmissions[0].with_you_animal,
      createdAt: mySubmissions[0].created_at,
    } : null;

    // 2. If user is partnered, check partner's submission
    let partnerArchetype = null;
    let partnerCompleted = false;

    if (partner) {
      const partnerSubmissions: any = await executeQuery(
        'SELECT looks_animal, behavior_animal, with_you_animal, created_at, updated_at FROM animal_archetypes WHERE user_id = $1',
        [Number(partner.id)]
      );

      partnerCompleted = !!(partnerSubmissions && partnerSubmissions.length > 0);

      // BLIND REVEAL MECHANIC: Only reveal partner's archetype if BOTH have completed!
      if (partnerCompleted && myArchetype) {
        partnerArchetype = {
          looksAnimal: partnerSubmissions[0].looks_animal,
          behaviorAnimal: partnerSubmissions[0].behavior_animal,
          withYouAnimal: partnerSubmissions[0].with_you_animal,
          createdAt: partnerSubmissions[0].created_at,
        };
      }
    }

    const bothCompleted = !!(myArchetype && partnerCompleted);

    return NextResponse.json({
      isPartnered: !!partner,
      partner,
      myArchetype,
      partnerCompleted,
      partnerArchetype,
      bothCompleted,
    });
  } catch (error: any) {
    console.error('Error fetching archetypes:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = Number(payload.userId);
    const body = await request.json();
    const { looksAnimal, behaviorAnimal, withYouAnimal } = body;

    if (!looksAnimal || !behaviorAnimal || !withYouAnimal) {
      return NextResponse.json(
        { error: 'Please choose an animal archetype for all 3 categories' },
        { status: 400 }
      );
    }

    if (
      !animalLibrary[looksAnimal] ||
      !animalLibrary[behaviorAnimal] ||
      !animalLibrary[withYouAnimal]
    ) {
      return NextResponse.json(
        { error: 'Invalid animal selected' },
        { status: 400 }
      );
    }

    // Upsert user archetype
    await executeQuery(
      `INSERT INTO animal_archetypes (user_id, looks_animal, behavior_animal, with_you_animal, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         looks_animal = $2,
         behavior_animal = $3,
         with_you_animal = $4,
         updated_at = CURRENT_TIMESTAMP`,
      [currentUserId, looksAnimal, behaviorAnimal, withYouAnimal]
    );

    return NextResponse.json({
      success: true,
      message: 'Archetype saved successfully!',
      archetype: {
        looksAnimal,
        behaviorAnimal,
        withYouAnimal,
      },
    });
  } catch (error: any) {
    console.error('Error saving archetype:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
