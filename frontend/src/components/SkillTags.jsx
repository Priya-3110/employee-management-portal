import { parseSkillText } from '../utils/formatters.js';

const SkillTags = ({ skills, emptyLabel = 'No skills listed', limit }) => {
  const parsedSkills = parseSkillText(skills);
  const visibleSkills = limit ? parsedSkills.slice(0, limit) : parsedSkills;
  const remainingCount = limit && parsedSkills.length > limit ? parsedSkills.length - limit : 0;

  if (!parsedSkills.length) {
    return <span className="text-sm text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleSkills.map((skill) => (
        <span key={skill} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
          {skill}
        </span>
      ))}
      {remainingCount ? (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">+{remainingCount}</span>
      ) : null}
    </div>
  );
};

export default SkillTags;
