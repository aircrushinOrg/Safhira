/**
 * Dynamic STI detail page displaying comprehensive information about specific sexually transmitted infections.
 * This page provides detailed medical information, symptoms, treatment options, and prevention strategies for individual STIs.
 * Features dynamic routing, content validation, and integration with the STI database for accurate, up-to-date medical information.
 */
import Client from './Client';
import { notFound } from 'next/navigation';
import { getSTIBySlug } from '../../actions/sti-actions';

export default async function Page({ params }: { params: Promise<{ sti: string }> }) {
  const { sti } = await params;
  const slug = sti.toLowerCase();

  const stiInfo = await getSTIBySlug(slug);

  if (!stiInfo) {
    notFound();
  }

  return <Client stiInfo={stiInfo} />;
}

