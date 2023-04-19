
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>

#define ERROR	-1
#define SUCCESS	0

#define PIPE_STR	"|"
#define SEMI_STR	";"

typedef	enum e_cmd_type
{
	PIPE,
	BREAK,
	LAST
}	t_cmd_type;

typedef struct s_cmd t_cmd;

typedef	struct s_cmd
{
	char		**av;
	int			size;
	t_cmd_type	type;
	int			fd[2];
	char		**env;
	t_cmd		*next;
	t_cmd		*prev;
}	t_cmd;

void	ft_bzro(void *m, int size)
{
	char *mem;
	int i	=0;

	mem = (char *)m;
	while (i < size)
	{
		mem[i] = 0;
		++i;
	}
}

void	*ft_calloc(int num, int size)
{
	void	*ret;

	ret = malloc(num * size);
	if (!ret)
		return (NULL);
	ft_bzro(ret, num * size);
	return (ret);
}

int	ft_strlen(char *s)
{
	int	i = 0;
	while (s[i])
		++i;
	return (i);
}

char *ft_strdup(char *src)
{
	int count = ft_strlen(src);
	int	i	=0;
	char *new;

	new = ft_calloc(sizeof(char), count + 1);
	if (!new)
		return (NULL);
	while (src[i])
	{
		new[i] = src[i];
		++i;
	}
	return (new);
}

int	tab_dup(char ***ret, char **src, int size)
{
	char **new;
	int	i = 0;

	new = ft_calloc(sizeof(char *), size + 1);
	if (!new)
		return (ERROR);
	while (i < size)
	{
		new[i] = ft_strdup(src[i]);
		if (!new[i])
			return (ERROR);
		++i;
	}
	new[i] = NULL;
	*ret = new;
	return (SUCCESS);
}

int	cmd_ctor(t_cmd **ret)
{
	t_cmd	*obj;

	obj = ft_calloc(1, sizeof(t_cmd));
	if (obj)
	{
		*ret = obj;
		return (SUCCESS);
	}
	return (ERROR);
}

void	cmd_dtor(t_cmd **c)
{
	t_cmd	*obj = *c;

	ft_bzro(obj, sizeof(t_cmd));
	free(obj);
	*c = NULL;
}

int	cmd_get_size(char **av)
{
	int	i = 0;

	while (av[i])
	{
		if (!strcmp(av[i], PIPE_STR) || !strcmp(av[i], SEMI_STR))
			return (i);
		++i;
	}
	return (i);
}

t_cmd_type	cmd_get_type(char **av)
{
	int	i = 0;

	while (av[i])
	{
		if (!strcmp(av[i], PIPE_STR))
			return (PIPE);
		if (!strcmp(av[i], SEMI_STR))
			return (BREAK);
		++i;
	}
	return (LAST);
}

void	list_add_last(t_cmd **ret, t_cmd *cur)
{
	t_cmd	*list = *ret;

	if (!list)
	{
		*ret = cur;
		return ;
	}
	while (list->next)
	{
		list = list->next;
	}
	list->next = cur;
	cur->prev = list;
}

int	create_cmd_list(t_cmd **ret, char **av, char **env)
{
	t_cmd	*list = NULL;
	t_cmd	*cmd;
	int	i = 1;
	int	stt = 0;

	while (av[i])
	{
		if (!strcmp(av[i], PIPE_STR) || !strcmp(av[i], SEMI_STR))
		{
			++i;
			continue;
		}
		stt = cmd_ctor(&cmd);
		if (ERROR == stt)
			exit(ERROR);
		list_add_last(&list, cmd);
		cmd->size = cmd_get_size(&(av[i]));
		cmd->type = cmd_get_type(&(av[i]));
		cmd->env = env;
		stt = tab_dup(&(cmd->av), &(av[i]), cmd->size);
		if (ERROR == stt)
			exit(ERROR);
		if (!cmd->size)
			++i;
		else	
			i += cmd->size;
	}
	*ret = list;
	return (SUCCESS);
}

void	tab_print(char **tab, int size)
{
	int	i = 0;

	while (i < size)
	{
		printf("[%s] ", tab[i]);
		++i;
	}
}

void	print_cmd(t_cmd *c)
{
	printf("--\ncmd\nsize: %d\ttype: %d\n", c->size, c->type);
	tab_print(c->av, c->size);
	printf("\nprev:% d\tnext:% d\n", !!c->prev, !!c->next);
}

void	print_all_cmd(t_cmd *l)
{
	while (l)
	{
		print_cmd(l);
		l = l->next;
	}
}

void	exec_cmd(t_cmd *c)
{
	pid_t	pid;

	if (PIPE == c->type || (c->prev && PIPE == c->prev->type))
	{
	}
	pid = fork();
}

void	exec_all_cmds(t_cmd	*c)
{
	while (c)
	{
		if (!strcmp(c->av[0], "cd"))
			exec_cd(c);
		else
			exec_cmd(c);
		c = c->next;
	}
}

int	main(int ac, char **av, char **env)
{
	t_cmd	*list;
	int		stt;

	(void)ac;
	stt = create_cmd_list(&list, av, env);
	if (SUCCESS == stt)
		print_all_cmd(list);
	return (SUCCESS);
}